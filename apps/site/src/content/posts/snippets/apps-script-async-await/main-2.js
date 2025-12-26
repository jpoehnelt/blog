const promise = new Promise((resolve, reject) => {
  resolve("hello world");
});

await promise; // doesn't work

function main() {
  console.log(promise.constructor.name);
}
