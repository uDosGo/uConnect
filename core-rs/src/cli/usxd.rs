use anyhow::Result;
use std::path::Path;

#[derive(Debug, Clone, Copy, clap::ValueEnum)]
pub enum ModeArg {
    Teletext,
    Mono,
    Wireframe,
}

pub fn render(path: &Path, mode: ModeArg) -> Result<()> {
    let surface = crate::usxd::parser::parse_surface(path)?;
    let theme = match mode {
        ModeArg::Teletext => ("TELETEXT", "\x1b[32m"),
        ModeArg::Mono => ("MONO", "\x1b[37m"),
        ModeArg::Wireframe => ("WIREFRAME", "\x1b[36m"),
    };
    print!("\x1b[40m{}\n", theme.1);
    println!("== USXD Surface: {} [{}] ==", surface.name, theme.0);
    for region in &surface.regions {
        println!("--- {} ---", region.title);
        println!("{}", region.content);
    }
    print!("\x1b[0m");
    Ok(())
}
