use anyhow::Result;

pub fn start() -> Result<()> {
    crate::server::ensure_default_config()?;
    crate::server::start_background()
}

pub fn stop() -> Result<()> {
    crate::server::stop_background()
}

pub fn status() -> Result<()> {
    crate::server::status_background()
}

pub fn logs() -> Result<()> {
    crate::server::print_logs()
}

pub fn mcp_stdio() -> Result<()> {
    crate::mcp::server::UDosMcpServer::new().run_stdio()
}
