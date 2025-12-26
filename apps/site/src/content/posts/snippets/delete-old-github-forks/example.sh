gh search repos \
  --owner jpoehnelt \
  --created="<2021-01-01" \
  --include-forks=only \
  --json url \
  --jq ".[] .url" \
| xargs -I {} \
  gh repo delete {} \
    --confirm