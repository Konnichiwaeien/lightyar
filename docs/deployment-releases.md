# Frontend deployment

Pushes to master run lint, tests, type checking and compilation in GitHub Actions.
The VPS then builds that exact commit against its own CMS settings.

The checkout is `/home/apps/lightyar`; builds live under
`/home/apps/lightyar-releases/<40-character-sha>.<6-character-suffix>`.

1. Build a separate candidate without disturbing the running site. Its Next.js
   BUILD_ID must equal the requested commit.
2. Start the candidate on loopback port 3004 and check its CMS connectivity and
   build identity. An occupied port or failed candidate aborts before switching.
3. Remove the existing PM2 process registration and start the selected ecosystem
   configuration. This deliberately recreates the process: startOrReload retained
   the old pm_cwd during the September 22 incident. Switching has a short outage;
   this single-process setup does not promise zero downtime.
4. Verify PM2 is online in the exact selected directory and port 3000 reports the
   expected BUILD_ID. Health reads `.next/BUILD_ID`, never the mutable release env.
5. Save PM2 state, update the current link, then prune obsolete releases. Keep the
   active directory and the actual previous PM2 directory. Symlinks, unrelated
   directories and paths outside the releases root are never recursively deleted.
6. GitHub Actions verifies the build identity through public HTTPS as well.

A failed build/candidate leaves the live process untouched. A failed switch
recreates the previous process, waits for its health, and saves restored PM2 state.
Failed candidate trees are removed after recovery. A failed rollback preserves
directories for diagnosis and fails the workflow. Retention failure after a healthy
switch fails the workflow without rolling back the working site.

The first successful corrected deployment also removes older accumulated release
directories, keeping its real predecessor for rollback. The current symlink alone
is not proof of what PM2 is running.

Read-only inspection on the VPS:

```bash
pm2 describe lightyar
readlink -f /home/apps/lightyar-releases/current
curl -fsS https://lightyar.ru/api/health
du -sh /home/apps/lightyar-releases/*
```
