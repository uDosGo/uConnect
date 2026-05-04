use anyhow::Result;

pub fn start() -> Result<()> {
    crate::mcp::server::UDosMcpServer::new().run_stdio()
}

pub fn list() -> Result<()> {
    let tools = crate::orchestrator::ok_handler::list_tools();
    println!("{}", serde_json::to_string_pretty(&tools)?);
    Ok(())
}

pub fn call(tool: &str, params: &str) -> Result<()> {
    let out = crate::orchestrator::ok_handler::call_tool(tool, params)?;
    println!("{}", serde_json::to_string_pretty(&out)?);
    Ok(())
}
