#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
sha=${1:?Exact verified commit is required}
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || exit 2
checkout=/home/lightyar
releases=/home/lightyar-releases
mkdir -p "$releases"
exec 9>"$releases/deploy.lock"
flock -n 9 || { echo 'Another deployment is active'; exit 1; }
export NVM_DIR="$HOME/.nvm"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then source "$NVM_DIR/nvm.sh"; fi
release=$(mktemp -d "$releases/$sha.XXXXXX")
git -C "$checkout" archive "$sha" | tar -x -C "$release"
for name in .env .env.production .env.local .env.production.local; do
  if [[ -f "$checkout/$name" ]]; then install -m 600 "$checkout/$name" "$release/$name"; fi
done
cd "$release"
npm ci
NODE_ENV=production node scripts/production-preflight.cjs
npm run build
export LIGHTYAR_RELEASE="$sha"
candidate_pid=''
switched=false
previous=$(pm2 jlist | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const p=JSON.parse(s).find(p=>p.name==="lightyar");if(p)process.stdout.write(p.pm2_env.pm_cwd);})')
previous_release=$(pm2 jlist | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const p=JSON.parse(s).find(p=>p.name==="lightyar");if(p)process.stdout.write(p.pm2_env.LIGHTYAR_RELEASE||"local");})')
cleanup() {
  local code=$?
  trap - EXIT
  if [[ -n "$candidate_pid" ]]; then kill "$candidate_pid" 2>/dev/null || true; wait "$candidate_pid" 2>/dev/null || true; fi
  if [[ "$code" -ne 0 && "$switched" == true ]]; then
    if [[ -n "$previous" && -f "$previous/ecosystem.config.js" ]]; then
      echo 'Restoring previous application release'
      export LIGHTYAR_RELEASE="$previous_release"
      pm2 startOrReload "$previous/ecosystem.config.js" --only lightyar --update-env
      if curl --fail --silent --max-time 10 http://127.0.0.1:3003/api/health >/dev/null || curl --fail --silent --max-time 10 http://127.0.0.1:3003/ >/dev/null; then pm2 save; else echo 'ROLLBACK NEEDS ATTENTION'; fi
    else
      pm2 delete lightyar || true
      echo 'No previous release exists; failed first release stopped'
    fi
  fi
  exit "$code"
}
trap cleanup EXIT
check() {
  curl --fail --silent --max-time 5 "http://127.0.0.1:$1/api/health" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{const j=JSON.parse(s);process.exit(j.status==="ok"&&j.release===process.env.LIGHTYAR_RELEASE?0:1)}catch{process.exit(1)}})'
}
# Occupied candidate port must not be mistaken for this release.
if curl --silent --max-time 2 http://127.0.0.1:3004/ >/dev/null; then echo 'Candidate port 3004 is occupied'; exit 1; fi
node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3004 >"$release/candidate.log" 2>&1 &
candidate_pid=$!
ready=false
for attempt in {1..30}; do
  kill -0 "$candidate_pid" || break
  if check 3004; then ready=true; break; fi
  sleep 2
done
[[ "$ready" == true ]] || { echo 'Candidate failed; live release untouched'; exit 1; }
kill "$candidate_pid"; wait "$candidate_pid" 2>/dev/null || true; candidate_pid=''
switched=true
pm2 startOrReload "$release/ecosystem.config.js" --only lightyar --update-env
ready=false
for attempt in {1..30}; do
  if check 3003; then ready=true; break; fi
  sleep 2
done
[[ "$ready" == true ]] || { echo 'New release failed health check'; exit 1; }
pm2 save
ln -sfn "$release" "$releases/current"
echo "Healthy frontend release: $sha"
