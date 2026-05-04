use anyhow::Result;

const PREFIXES: [&str; 16] = [
    "Silent", "Steel", "Amber", "Neon", "Velvet", "Solar", "Lunar", "Signal", "Dust", "Copper",
    "Delta", "River", "Echo", "Cipher", "Atlas", "Ghost",
];
const CONNECTORS: [&str; 8] = [
    "of the", "from", "near", "beyond", "within", "under", "over", "against",
];
const SUFFIXES: [&str; 16] = [
    "Harbor", "Comet", "Spire", "Circuit", "Vale", "Archive", "Vector", "Station", "Garden",
    "Beacon", "Forge", "Atlas", "Delta", "Orbit", "Ridge", "Signal",
];

pub fn generate(seed: &str) -> Result<()> {
    let h1 = fnv1a_32(seed.as_bytes());
    let h2 = fnv1a_32(format!("{seed}:connector").as_bytes());
    let h3 = fnv1a_32(format!("{seed}:suffix").as_bytes());

    let p = PREFIXES[(h1 as usize) % PREFIXES.len()];
    let c = CONNECTORS[(h2 as usize) % CONNECTORS.len()];
    let s = SUFFIXES[(h3 as usize) % SUFFIXES.len()];
    println!("{p} {c} {s}");
    Ok(())
}

fn fnv1a_32(bytes: &[u8]) -> u32 {
    let mut hash: u32 = 0x811c9dc5;
    for b in bytes {
        hash ^= u32::from(*b);
        hash = hash.wrapping_mul(0x0100_0193);
    }
    hash
}
