gh api --paginate "https://api.github.com/user/subscriptions" |
  | jq '.[] | .full_name' \
  | grep googlemaps \
  | xargs -I {} \
    gh api \
      -X DELETE \
      "https://api.github.com/repos/{}/subscription"