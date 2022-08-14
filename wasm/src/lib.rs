use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
	#[wasm_bindgen(js_namespace = console)]
	fn log(s: &str);
}

macro_rules! console_log {
	($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn greet(name: &str) {
	console_log!("Hello {}, welcome from Rust!!", name);
}

#[wasm_bindgen(getter_with_clone)]
pub struct MergeResult {
	pub success: bool,
	pub value: String,
}

#[wasm_bindgen]
pub fn merge(origin: &str, current: &str, remote: &str) -> MergeResult {
	match diffy::merge(origin, current, remote) {
		Ok(value) => MergeResult {
			success: true,
			value,
		},
		_ => MergeResult {
			success: false,
			value: remote.to_string(),
		},
	}
}
