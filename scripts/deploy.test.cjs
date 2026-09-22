const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { removeRelease, pruneReleases } = require('./release-storage.cjs');
const bash = process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : 'bash';
const script = fs.readFileSync(path.join(__dirname, 'deploy.sh'), 'utf8').replaceAll('\r\n', '\n');
const fixtures = path.resolve(__dirname, '../tmp/deploy-tests');
fs.mkdirSync(fixtures, { recursive: true });
const sha = 'a'.repeat(40);
const oldSha = 'b'.repeat(40);
test('health reports the build on disk even when PM2 env claims a different commit', async () => {
  const ts = require('typescript');
  const vm = require('node:vm');
  const source = fs.readFileSync(path.join(__dirname, '../app/api/health/route.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(compiled, {
    exports: loaded.exports, module: loaded,
    process: { cwd: () => '/old-build', env: { STRAPI_API_URL: 'http://cms/api', STRAPI_READ_TOKEN: 'test', LIGHTYAR_RELEASE: sha } },
    AbortSignal,
    fetch: async () => ({ ok: true, json: async () => ({ data: [] }) }),
    require: name => {
      if (name === 'next/server') return { NextResponse: { json: (body, options) => ({ body, options }) } };
      if (name === 'node:fs/promises') return { readFile: async file => {
        assert.equal(file, path.join('/old-build', '.next', 'BUILD_ID'));
        return oldSha + '\n';
      } };
      return require(name);
    },
  });
  const result = await loaded.exports.GET();
  assert.equal(result.body.release, oldSha);
  assert.equal(result.options.headers['Cache-Control'], 'no-store');
});
function fixture() {
  const root = fs.mkdtempSync(path.join(fixtures, 'case-'));
  const releases = path.join(root, 'releases');
  fs.mkdirSync(releases);
  const current = path.join(releases, `${sha}.ABC123`);
  const previous = path.join(releases, `${oldSha}.DEF456`);
  const obsolete = path.join(releases, `${'c'.repeat(40)}.GHI789`);
  for (const dir of [current, previous, obsolete]) {
    fs.mkdirSync(path.join(dir, '.next'), { recursive: true });
    fs.writeFileSync(path.join(dir, '.next/BUILD_ID'), dir === current ? sha : oldSha);
    fs.writeFileSync(path.join(dir, 'ecosystem.config.js'), '');
  }
  fs.mkdirSync(path.join(current, 'scripts'));
  fs.copyFileSync(path.join(__dirname, 'release-storage.cjs'), path.join(current, 'scripts/release-storage.cjs'));
  return { root, releases, current, previous, obsolete };
}

test('deployment shell is valid', () => {
  const result = spawnSync(bash, ['-n'], { input: script, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
test('release switching must not reload an existing process from its old cwd', () => {
  assert.doesNotMatch(script, /pm2 startOrReload/);
  assert.match(script, /pm2 delete lightyar/);
  assert.match(script, /pm2 start "\$target\/ecosystem.config.js"/);
});
for (const scenario of ['success', 'build-failure', 'wrong-build', 'candidate-failure', 'live-failure', 'stale-cwd', 'wrong-live-version', 'bootstrap', 'bootstrap-live-failure', 'rollback-failure', 'occupied-port']) {
  test(`deployment simulation: ${scenario}`, () => {
    const f = fixture();
    const normal = p => p.replaceAll('\\', '/');
    fs.writeFileSync(path.join(f.root, 'state'), scenario.startsWith('bootstrap') ? '' : normal(f.previous));
    const harness = String.raw`
set -Eeuo pipefail
flock() { :; }
mktemp() { echo "$NEW_RELEASE"; }
git() { :; }
tar() { cat >/dev/null; }
install() { :; }
npm() {
  echo "npm $*" >>"$MOCK_DIR/log"
  [[ "$SCENARIO" == build-failure && "$*" == 'run build' ]] && return 1
  if [[ "$SCENARIO" == wrong-build && "$*" == 'run build' ]]; then echo wrong > .next/BUILD_ID; fi
  return 0
}
node() {
  if [[ "$1" == node_modules/next/dist/bin/next || "$1" == scripts/production-preflight.cjs ]]; then return 0; fi
  "$REAL_NODE" "$@"
}
pm2() {
  echo "pm2 $*" >>"$MOCK_DIR/log"
  local cwd
  cwd=$(cat "$MOCK_DIR/state")
  case "$1" in
    ping) echo ready ;;
    describe) [[ -n "$cwd" ]]; return $? ;;
    jlist)
      if [[ -z "$cwd" ]]; then echo '[]'; else printf '[{"name":"lightyar","pm2_env":{"status":"online","pm_cwd":"%s"}}]\n' "$cwd"; fi ;;
    delete) : >"$MOCK_DIR/state" ;;
    start)
      local target
      target=$(dirname "$2")
      if [[ "$SCENARIO" == rollback-failure && "$target" == "$OLD_RELEASE" ]]; then return 1; fi
      if [[ "$SCENARIO" == stale-cwd && "$target" == "$NEW_RELEASE" ]]; then target=$OLD_RELEASE; fi
      echo "$target" >"$MOCK_DIR/state" ;;
    startOrReload) echo 'BUG: cwd retained' >>"$MOCK_DIR/log" ;;
  esac
  return 0
}
curl() {
  if [[ "$*" == *3004/* && "$*" != *api/health* ]]; then [[ "$SCENARIO" == occupied-port ]]; return $?; fi
  [[ "$SCENARIO" == candidate-failure && "$*" == *3004/api/health* ]] && return 1
  local version=$LIGHTYAR_BUILD_SHA
  if [[ "$*" == *3000/* ]]; then
    local cwd
    cwd=$(cat "$MOCK_DIR/state")
    [[ -n "$cwd" ]] || return 1
    if [[ ( "$SCENARIO" == *live-failure || "$SCENARIO" == rollback-failure ) && "$cwd" == "$NEW_RELEASE" ]]; then return 1; fi
    version=$(cat "$cwd/.next/BUILD_ID")
    # Model the original false success: new env SHA even with old cwd.
    [[ "$SCENARIO" == stale-cwd ]] && version=$LIGHTYAR_BUILD_SHA
    [[ "$SCENARIO" == wrong-live-version && "$cwd" == "$NEW_RELEASE" ]] && version=wrong
  fi
  printf '{"status":"ok","release":"%s"}' "$version"
}
kill() { :; }
wait() { :; }
sleep() { :; }
ln() { echo linked-current >>"$MOCK_DIR/log"; }
`;
    const candidate = script.replace('checkout=/home/apps/lightyar', 'checkout="$MOCK_DIR"')
      .replace('releases=/home/apps/lightyar-releases', 'releases="$RELEASES"')
      .replace('export NVM_DIR="$HOME/.nvm"', 'export NVM_DIR="$MOCK_DIR/no-nvm"')
      .replaceAll('{1..30}', '{1..2}');
    const result = spawnSync(bash, ['-s', '--', sha], {
      input: harness + '\n' + candidate, encoding: 'utf8', timeout: 30000,
      env: { ...process.env, MOCK_DIR: normal(f.root), RELEASES: normal(f.releases), NEW_RELEASE: normal(f.current), OLD_RELEASE: normal(f.previous), SCENARIO: scenario, REAL_NODE: normal(process.execPath) },
    });
    const log = fs.readFileSync(path.join(f.root, 'log'), 'utf8');
    const succeeds = ['success', 'bootstrap'].includes(scenario);
    assert.equal(result.status, succeeds ? 0 : 1, result.stdout + result.stderr);
    const state = fs.readFileSync(path.join(f.root, 'state'), 'utf8').trim();
    if (succeeds) {
      assert.equal(state, normal(f.current));
      assert.equal(fs.existsSync(f.obsolete), false);
      assert.equal(fs.existsSync(f.previous), scenario !== 'bootstrap');
    } else if (scenario !== 'rollback-failure') {
      assert.equal(state, scenario.startsWith('bootstrap') ? '' : normal(f.previous));
      assert.equal(fs.existsSync(f.current), false, 'failed candidate must be removed');
      assert.equal(fs.existsSync(f.obsolete), true, 'no pruning on failure');
    } else {
      assert.equal(fs.existsSync(f.current), true, 'retain evidence after failed rollback');
    }
    if (['build-failure', 'wrong-build', 'candidate-failure', 'occupied-port'].includes(scenario)) assert.doesNotMatch(log, /pm2 delete/);
    assert.equal(log.includes('linked-current'), succeeds);
  });
}

test('retention preserves current, previous, unrelated directories and external symlink targets', () => {
  const f = fixture();
  const outside = path.join(f.root, `${'d'.repeat(40)}.OUT123`);
  fs.mkdirSync(outside);
  fs.mkdirSync(path.join(f.releases, 'manual-backup'));
  fs.symlinkSync(outside, path.join(f.releases, `${'e'.repeat(40)}.LNK123`), 'junction');
  fs.symlinkSync(f.current, path.join(f.releases, 'current'), 'junction');
  pruneReleases(f.releases, f.current, f.previous);
  assert.ok(fs.existsSync(f.current));
  assert.ok(fs.existsSync(f.previous));
  assert.ok(fs.existsSync(outside));
  assert.ok(fs.existsSync(path.join(f.releases, 'manual-backup')));
  assert.equal(fs.existsSync(f.obsolete), false);
  assert.throws(() => removeRelease(f.releases, f.current), /current release/);
  assert.throws(() => removeRelease(f.releases, outside), /contract/);
  assert.throws(() => removeRelease(f.releases, path.join(f.releases, `${'e'.repeat(40)}.LNK123`)), /symlink/);
});
