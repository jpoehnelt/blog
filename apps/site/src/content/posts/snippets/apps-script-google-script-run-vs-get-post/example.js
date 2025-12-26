google.script.run
  .withSuccessHandler((result, userObject) =>
    console.log({ result, userObject }),
  )
  .withUserObject(this)
  .readData();
