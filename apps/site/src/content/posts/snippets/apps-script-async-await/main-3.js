async function main() {
  let bytes = new Uint8Array(
    Utilities.base64Decode(
      "AGFzbQEAAAABBwFgAn9/AX8DAgEAB" +
        "wcBA2FkZAAACgkBBwAgACABagsAHA" +
        "RuYW1lAQYBAANhZGQCDQEAAgADbGh" +
        "zAQNyaHM=",
    ),
  );

  let {
    instance: {
      exports: { add },
    },
  } = await WebAssembly.instantiate(bytes);

  console.log(add(1, 2));
}
