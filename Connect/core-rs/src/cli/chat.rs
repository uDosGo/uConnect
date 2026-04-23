use anyhow::Result;

pub fn run(personality: &str, prompt: &str) -> Result<()> {
    let persona = crate::orchestrator::personality::get(personality)?;
    let response = format!("{} {}", persona.core_line, prompt);
    let entry = crate::orchestrator::chat::ChatEntry {
        personality: personality.to_string(),
        prompt: prompt.to_string(),
        response: response.clone(),
    };
    crate::orchestrator::chat::append(&entry)?;
    println!("{response}");
    Ok(())
}

pub fn history() -> Result<()> {
    let items = crate::orchestrator::chat::read_history()?;
    for i in items {
        println!("[{}] {} -> {}", i.personality, i.prompt, i.response);
    }
    Ok(())
}
