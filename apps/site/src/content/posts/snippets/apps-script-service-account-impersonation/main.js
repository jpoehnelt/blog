function main() {
  const token = generateAccessTokenForServiceAccount(
    // can also be the email: foo@your-project.iam.gserviceaccount.com
    "112304111718889638064",
    ["https://www.googleapis.com/auth/datastore"],
  );

  // verify the token
  console.log(
    UrlFetchApp.fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
    ).getContentText(),
  );
}
