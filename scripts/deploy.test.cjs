const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
const script=fs.readFileSync(path.join(__dirname,'deploy.sh'),'utf8');
test('deployment shell is valid',()=>{const result=spawnSync(bash,['-n'],{input:script,encoding:'utf8'});assert.equal(result.status,0,result.stderr);});
for(const scenario of ['success','build-failure','candidate-failure','live-failure']) {
  test(`deployment simulation: ${scenario}`,()=>{
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lightyar-deploy-')).replaceAll('\\','/');
    fs.mkdirSync(`${dir}/release`);fs.mkdirSync(`${dir}/previous`);fs.writeFileSync(`${dir}/previous/ecosystem.config.js`,'');
    const harness=String.raw`
set -Eeuo pipefail
mkdir() { :; }
flock() { :; }
mktemp() { echo "$MOCK_DIR/release"; }
git() { :; }
tar() { cat >/dev/null; }
install() { :; }
npm() { echo "npm $*" >>"$MOCK_DIR/log"; [[ "$SCENARIO" != build-failure || "$*" != 'run build' ]]; }
node() {
  if [[ "$1" == -e ]]; then
    cat >/dev/null
    if [[ "$2" == *pm_cwd* ]]; then echo "$MOCK_DIR/previous"; elif [[ "$2" == *JSON.parse*s*find* ]]; then echo 'old'; fi
  fi
  return 0
}
pm2() {
  echo "pm2 $*" >>"$MOCK_DIR/log"
  if [[ "$1" == startOrReload ]]; then
    if [[ "$2" == *previous* ]]; then echo old >"$MOCK_DIR/state"; else echo new >"$MOCK_DIR/state"; fi
  fi
}
curl() {
  [[ "$*" == *3004/* && "$*" != *api/health* ]] && return 1
  [[ "$SCENARIO" == candidate-failure && "$*" == *3004/api/health* ]] && return 1
  if [[ "$SCENARIO" == live-failure && "$*" == *3003/* && -f "$MOCK_DIR/state" && $(cat "$MOCK_DIR/state") == new ]]; then return 1; fi
  return 0
}
kill() { :; }
wait() { :; }
sleep() { :; }
ln() { echo "linked-current" >>"$MOCK_DIR/log"; }
`;
    const candidate=script.replace('checkout=/home/lightyar', 'checkout="$MOCK_DIR"').replace('releases=/home/lightyar-releases','releases="$MOCK_DIR"').replace('export NVM_DIR="$HOME/.nvm"','export NVM_DIR="$MOCK_DIR/no-nvm"');
    const result=spawnSync(bash,['-s','--','a'.repeat(40)],{input:harness+'\n'+candidate,encoding:'utf8',env:{...process.env,MOCK_DIR:dir,SCENARIO:scenario},timeout:15000});
    const log=fs.readFileSync(`${dir}/log`,'utf8');
    assert.equal(result.status,scenario==='success'?0:1,result.stdout+result.stderr);
    if(scenario==='build-failure'||scenario==='candidate-failure')assert.doesNotMatch(log,/pm2 startOrReload/);
    if(scenario==='live-failure')assert.match(log,/pm2 startOrReload .*previous\/ecosystem/);
    assert.equal(log.includes('linked-current'),scenario==='success');
  });
}
