# History Cleanup Summary & Instructions

Status: I performed a local history rewrite removing `node_modules` and `dist` folders and force-pushed the cleaned history to `origin`.

Backups created locally and pushed as:
- branch: `backup-before-history-clean`
- tag: `backup-before-history-clean-tag`

If you want an alternative / more thorough cleanup or prefer to use a tool that is faster and safer for large repos, use one of these options locally:

1) BFG Repo-Cleaner (simple, recommended for common cases)

```bash
# clone a mirror
git clone --mirror https://github.com/USERNAME/REPO.git
cd REPO.git
# remove folders
java -jar bfg.jar --delete-folders node_modules --delete-folders dist
# expire reflogs and GC
git reflog expire --expire=now --all
git gc --prune=now --aggressive
# push cleaned history
git push --force
```

2) git-filter-repo (powerful, recommended if you need path rewrites)

```bash
# install git-filter-repo (per project instructions)
git clone --mirror https://github.com/USERNAME/REPO.git
cd REPO.git
git filter-repo --invert-paths --paths node_modules --paths dist
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

Notes:
- I left the `backup-before-history-clean` branch and tag intact; delete them only after you confirm remote looks correct.
- After force-push, contributors must re-clone or reset their local clones (force-pull is destructive).
- You may also remove the local mirror (`REPO.git`) after confirming remote.

If you want, I can:
- remove the local `backup-before-history-clean` branch now, or
- remove the backup branch and tag from the remote as well (requires explicit confirmation).
