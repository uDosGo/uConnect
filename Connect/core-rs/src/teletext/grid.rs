use crate::teletext::{ascii, blocks};

pub fn cell_2x6_to_teletext_block(cell: [[char; 2]; 6]) -> u8 {
    let mut filled = 0usize;
    for row in &cell {
        for c in row {
            if !matches!(*c, ' ' | '.') {
                filled += 1;
            }
        }
    }
    match filled {
        0 => b' ',
        1..=3 => blocks::LOWER_HALF,
        4..=6 => blocks::UPPER_HALF,
        7..=9 => blocks::LEFT_HALF,
        10..=11 => blocks::RIGHT_HALF,
        _ => blocks::FULL_BLOCK,
    }
}

pub fn obf_like_grid_to_codes(input: &str) -> Vec<u8> {
    input
        .lines()
        .flat_map(|line| ascii::convert_ascii_text_to_codes(line))
        .collect()
}
