use anyhow::Result;

pub fn print_surface_summary(name: &str, regions: usize) -> Result<()> {
    println!("USXD surface: {name} ({regions} regions)");
    Ok(())
}
