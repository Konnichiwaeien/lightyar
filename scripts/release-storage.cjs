const fs = require('node:fs');
const path = require('node:path');

const releaseName = /^[0-9a-f]{40}\.[A-Za-z0-9]{6}$/;
function releaseDirectory(root, target) {
  const full = path.resolve(target);
  if (path.dirname(full) !== root || !releaseName.test(path.basename(full))) {
    throw new Error('Refusing a path outside the release directory contract');
  }
  const stat = fs.lstatSync(full);
  if (!stat.isDirectory() || stat.isSymbolicLink() || fs.realpathSync(full) !== full) {
    throw new Error('Refusing a symlink or non-directory release');
  }
  return full;
}
function removeRelease(root, target) {
  root = fs.realpathSync(root);
  const full = releaseDirectory(root, target);
  if (fs.existsSync(path.join(root, 'current')) && fs.realpathSync(path.join(root, 'current')) === full) {
    throw new Error('Refusing to remove current release');
  }
  fs.rmSync(full, { recursive: true });
}
function pruneReleases(root, current, previous) {
  root = fs.realpathSync(root);
  const keep = new Set([fs.realpathSync(current)]);
  if (previous) keep.add(fs.realpathSync(previous));
  releaseDirectory(root, current);
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.isSymbolicLink() || !releaseName.test(entry.name)) continue;
    const target = path.join(root, entry.name);
    if (!keep.has(target)) removeRelease(root, target);
  }
}
module.exports = { removeRelease, pruneReleases };
if (require.main === module) {
  const [action, root, current, previous] = process.argv.slice(2);
  if (action === 'prune') pruneReleases(root, current, previous);
  else if (action === 'remove') removeRelease(root, current);
  else throw new Error('Unknown release storage action');
}
