use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use log::{info, error};

#[derive(Debug, Serialize, Deserialize)]
struct Event {
    event_type: String,
    message: String,
    #[serde(rename = "game")]
    game_metadata: Option<GameMetadata>,
}

#[derive(Debug, Serialize, Deserialize)]
struct GameMetadata {
    edition: String,
    theme: String,
    level: Option<i32>,
    action: Option<String>,
    item: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct TranslationRule {
    pattern: String,
    story: String,
    student: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Config {
    editions: std::collections::HashMap<String, EditionConfig>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EditionConfig {
    theme: String,
    translation_rules: Vec<TranslationRule>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();
    
    // Load configuration
    let config_path = PathBuf::from("~/.storyteller/config.yaml");
    let config = load_config(&config_path).await?;
    
    // Watch feed spool for new events
    // For now, we'll process existing events as a one-time run
    let feed_spool_path = PathBuf::from("/Users/fredbook/Code/Vault/.uds/feed.json");
    
    if !feed_spool_path.exists() {
        error!("Feed spool not found at {:?}", feed_spool_path);
        return Ok(());
    }
    
    let feed_content = fs::read_to_string(feed_spool_path)?;
    let events: Vec<Event> = serde_json::from_str(&feed_content)
        .unwrap_or_else(|_| Vec::new());
    
    // Process each event
    for event in events {
        if let Some(game_meta) = &event.game_metadata {
            if let Some(edition_config) = config.editions.get(&game_meta.edition) {
                // Find matching translation rule
                if let Some(rule) = edition_config.translation_rules.iter()
                    .find(|r| event.message.contains(&r.pattern)) {
                    
                    // Generate public story
                    let public_story = generate_story(&rule.story, game_meta);
                    write_to_file(
                        &PathBuf::from(format!("~/Code/Vault/.story/public/{}.md", game_meta.level.unwrap_or(1))),
                        &public_story,
                    )?;
                    
                    // Generate student tutorial
                    let student_tutorial = generate_tutorial(&rule.student, game_meta);
                    write_to_file(
                        &PathBuf::from(format!("~/Code/Vault/.story/student/{}.md", game_meta.level.unwrap_or(1))),
                        &student_tutorial,
                    )?;
                    
                    info!("Processed event: {}", event.message);
                }
            }
        }
    }
    
    Ok(())
}

fn generate_story(template: &str, meta: &GameMetadata) -> String {
    template
        .replace("{level}", &meta.level.map_or("1".to_string(), |l| l.to_string()))
        .replace("{action}", &meta.action.as_deref().unwrap_or("unknown"))
        .replace("{item}", &meta.item.as_deref().unwrap_or("artifact"))
}

fn generate_tutorial(template: &str, meta: &GameMetadata) -> String {
    format!(
        "# Level {} Tutorial\n\n{}\n\n## Technical Details\n\n- Edition: {}\n- Theme: {}\n- Action: {}\n",
        meta.level.unwrap_or(1),
        template,
        meta.edition,
        meta.theme,
        meta.action.as_deref().unwrap_or("unknown")
    )
}

fn write_to_file(path: &PathBuf, content: &str) -> Result<(), Box<dyn std::error::Error>> {
    let expanded_path: std::path::PathBuf = shellexpand::tilde(path.to_string_lossy().as_ref()).into_owned().into();
    if let Some(parent) = expanded_path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(&expanded_path, content)?;
    Ok(())
}

async fn load_config(path: &PathBuf) -> Result<Config, Box<dyn std::error::Error>> {
    let expanded_path: std::path::PathBuf = shellexpand::tilde(path.to_string_lossy().as_ref()).into_owned().into();
    if !expanded_path.exists() {
        // Create default config
        let default_config = Config {
            editions: std::collections::HashMap::new(),
        };
        let yaml = serde_yaml::to_string(&default_config)?;
        fs::write(&expanded_path, yaml)?;
    }
    
    let content = fs::read_to_string(&expanded_path)?;
    let config: Config = serde_yaml::from_str(&content)?;
    Ok(config)
}
