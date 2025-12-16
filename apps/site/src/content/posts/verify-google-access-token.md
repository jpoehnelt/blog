---
title: Verify a Google access token
description: A simple endpoint to verify a Google access token
pubDate: "2023-04-10"
tags: "code,google,oauth"
---

A Google access token can be verified using the following command to an Oauth2 endpoint:

```bash
curl "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=$GOOGLE_ACCESS_TOKEN"
```

The response will include the scope and additional information about the access token similar to the following for a service account access token:

```bash
{
  "issued_to": "1068863916064001234",
  "audience": "1068863916064001234",
  "user_id": "1068863916064001234",
  "scope": "https://www.googleapis.com/auth/userinfo.email openid",
  "expires_in": 3555,
  "email": "my-service-account@my-project.iam.gserviceaccount.com",
  "verified_email": true,
  "access_type": "online"
}
```
