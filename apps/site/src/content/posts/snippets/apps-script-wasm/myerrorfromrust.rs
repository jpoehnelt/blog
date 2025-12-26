#[wasm_bindgen(inline_js = r"
export class MyErrorFromRust extends Error {
    constructor(message) {
        super(message);
    }
}
")]
extern "C" {
    pub type MyErrorFromRust;
    #[wasm_bindgen(constructor)]
    fn new(message: JsValue) -> MyErrorFromRust;
}