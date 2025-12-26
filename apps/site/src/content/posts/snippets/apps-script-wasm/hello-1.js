export function hello(name) {
  const ptr0 = passStringToWasm0(
    name,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.hello(ptr0, len0);
  return takeObject(ret);
}
