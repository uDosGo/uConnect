// uDos Core Library
// Central library for uDos platform components

pub mod ceetex;

/// Initialize the core library
pub fn init() {
    // Initialize all core components
    println!("uDos Core Library initialized");
}

/// Get version information
pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}