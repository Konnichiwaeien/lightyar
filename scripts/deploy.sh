#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
sha=${1:?Exact verified commit is required}
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || exit 2
checkout=/home/apps/lightyar
releases=/home/apps/lightyar-releases
mkdir -p "$releases"
exec 9>"$releases/deploy.lock"
flock -n 9 || { echo 'Another deployment is active'; exit 1; }
export NVM_DIR="$HOME/.nvm"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then source "$NVM_DIR/nvm.sh"; fi
pm2 ping >/dev/null
previous=$(pm2 jlist | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const p=JSON.parse(s).find(p=>p.name==="lightyar");if(p)process.stdout.write(p.pm2_env.pm_cwd);})')
release=$(mktemp -d "$releases/$sha.XXXXXX")
candidate_pid=''
switched=false
committed=false

# Reload can retain pm_cwd. Recreate the process from the selected config.
start_release() {
  local target=$1
  if pm2 describe lightyar >/dev/null 2>&1; then pm2 delete lightyar || return; fi
  pm2 start "$target/ecosystem.config.js" --only lightyar --update-env
}
check_process() {
  pm2 jlist | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{const fs=require("fs");const p=JSON.parse(s).find(p=>p.name==="lightyar");process.exit(p&&p.pm2_env.status==="online"&&fs.realpathSync(p.pm2_env.pm_cwd)===fs.realpathSync(process.argv[1])?0:1)}catch{process.exit(1)}})' "$1"
}
check() {
  curl --fail --silent --max-time 5 "http://127.0.0.1:$1/api/health" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{const j=JSON.parse(s);process.exit(j.status==="ok"&&(!process.argv[1]||j.release===process.argv[1])?0:1)}catch{process.exit(1)}})' "${2:-}"
}
cleanup() {
  local code=$?
  trap - EXIT
  set +e
  if [[ -n "$candidate_pid" ]]; then kill "$candidate_pid" 2>/dev/null; wait "$candidate_pid" 2>/dev/null; fi
  if [[ "$code" -ne 0 && "$committed" == false ]]; then
    if [[ "$switched" == true ]]; then
      if [[ -n "$previous" && -f "$previous/ecosystem.config.js" ]]; then
        echo "Restoring previous application directory: $previous"
        export LIGHTYAR_RELEASE="$(basename "$previous" | cut -d. -f1)"
        restored=false
        if start_release "$previous"; then
          for attempt in {1..30}; do
            if check_process "$previous" && check 3000; then restored=true; break; fi
            sleep 2
          done
        fi
        if [[ "$restored" == true ]]; then pm2 save; else echo 'ROLLBACK NEEDS ATTENTION; release directories retained'; exit "$code"; fi
      else
        pm2 delete lightyar 2>/dev/null || true
        pm2 save --force
        echo 'No previous release exists; failed first release stopped'
      fi
    fi
    cd "$checkout"
    if [[ -f "$release/scripts/release-storage.cjs" ]]; then
      node "$release/scripts/release-storage.cjs" remove "$releases" "$release"
    fi
  fi
  exit "$code"
}
trap cleanup EXIT
git -C "$checkout" archive "$sha" | tar -x -C "$release"
for name in .env .env.production .env.local .env.production.local; do
  if [[ -f "$checkout/$name" ]]; then install -m 600 "$checkout/$name" "$release/$name"; fi
done
cd "$release"
npm ci
NODE_ENV=production node scripts/production-preflight.cjs
export LIGHTYAR_BUILD_SHA="$sha"
npm run build
[[ "$(cat .next/BUILD_ID)" == "$sha" ]] || { echo 'Built version does not match requested commit'; exit 1; }
if curl --silent --max-time 2 http://127.0.0.1:3004/ >/dev/null; then echo 'Candidate port 3004 is occupied'; exit 1; fi
node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3004 >"$release/candidate.log" 2>&1 &
candidate_pid=$!
ready=false
for attempt in {1..30}; do
  kill -0 "$candidate_pid" || break
  if check 3004 "$sha"; then ready=true; break; fi
  sleep 2
done
[[ "$ready" == true ]] || { echo 'Candidate failed; live release untouched'; exit 1; }
kill "$candidate_pid"; wait "$candidate_pid" 2>/dev/null || true; candidate_pid=''
switched=true
start_release "$release"
ready=false
for attempt in {1..30}; do
  if check_process "$release" && check 3000 "$sha"; then ready=true; break; fi
  sleep 2
done
[[ "$ready" == true ]] || { echo 'New release failed directory/version/health check'; exit 1; }
pm2 save
ln -sfn "$release" "$releases/current"
committed=true
# Only prune after success. Keep the actual predecessor, not a stale current link.
node scripts/release-storage.cjs prune "$releases" "$release" "$previous"
echo "Healthy frontend release: $sha ($release)"
