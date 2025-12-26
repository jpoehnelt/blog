async function main() {
  const promise = new Promise((resolve, reject) => {
    resolve("hello world");
  });

  console.log(promise.constructor.name);
  console.log(await promise);
}
