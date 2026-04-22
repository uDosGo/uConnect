use anyhow::Result;

pub fn query(prompt: &str) -> Result<()> {
    println!("agent query (A2-stub): {prompt}");
    Ok(())
}

pub fn hivemind(prompt: &str) -> Result<()> {
    println!("agent hivemind (A2-stub): {prompt}");
    Ok(())
}

pub fn status() -> Result<()> {
    for (k, v) in crate::orchestrator::hivemind::status() {
        println!("{k}: {v}");
    }
    Ok(())
}

pub fn rankings() -> Result<()> {
    let data = crate::orchestrator::hivemind::rankings();
    println!("{}", serde_json::to_string_pretty(&data)?);
    Ok(())
}
