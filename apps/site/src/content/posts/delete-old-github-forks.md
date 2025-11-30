---
title: Delete Old GitHub Forks
description: Cleanup repositories on GitHUb by deleting old forks.
pubDate: '2022-10-19'
tags: 'code,GitHub,gh,forks,cleanup'
---

Was browsing through my GitHub repositories and realized I have an embarrassing number of forks.  A lot of these contain code that is either out of date or not even valid anymore. I used the following to quickly cleanup these repositories that I created before `2021-01-01`.

```bash
gh search repos \
  --owner jpoehnelt \
  --created="<2021-01-01" \
  --include-forks=only \
  --json url \
  --jq ".[] .url" \
| xargs -I {} \
  gh repo delete {} \
    --confirm
```

You may need to refresh your auth with the `delete_repo` scope.

```bash
gh auth refresh -h github.com -s delete_repo
```
