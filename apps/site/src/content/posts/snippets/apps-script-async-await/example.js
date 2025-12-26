new Promise((resolve, reject) => {
  console.log("start");
  Utilities.sleep(2000);
  console.log("end");
  resolve();
}).then(() => console.log("done"));
console.log("next");
