use anyhow::Result;

#[derive(Debug, Clone)]
pub struct OBFBlock {
    pub id: String,
    pub lines: Vec<String>,
}

pub fn parse_blocks(input: &str) -> Result<Vec<OBFBlock>> {
    let mut blocks = Vec::new();
    for (idx, chunk) in input.split("\n\n").enumerate() {
        if chunk.trim().is_empty() {
            continue;
        }
        blocks.push(OBFBlock {
            id: format!("block-{}", idx + 1),
            lines: chunk.lines().map(ToOwned::to_owned).collect(),
        });
    }
    Ok(blocks)
}
