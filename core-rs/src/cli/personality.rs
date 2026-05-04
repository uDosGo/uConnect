use anyhow::Result;

pub fn list() -> Result<()> {
    for p in crate::orchestrator::personality::list() {
        println!("{p}");
    }
    Ok(())
}

pub fn set(name: &str) -> Result<()> {
    let p = crate::orchestrator::personality::get(name)?;
    println!("default personality set: {} ({})", name, p.tone);
    Ok(())
}
