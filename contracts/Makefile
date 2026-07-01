build:
	cargo build --release --target wasm32-unknown-unknown
	wasm-strip target/wasm32-unknown-unknown/release/marketplace.wasm 2>/dev/null || true
	wasm-strip target/wasm32-unknown-unknown/release/registry.wasm 2>/dev/null || true

clean:
	cargo clean
