// src/lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hello(name: &str) -> JsValue {
   format!("Hello, {} from Rust!", name).into()
}