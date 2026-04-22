use crate::teletext::blocks;

pub fn ascii_char_to_teletext_code(c: char) -> u8 {
    match c {
        '\u{0000}'..='\u{001F}' => b' ',
        ' '..='~' => c as u8,
        '█' => blocks::FULL_BLOCK,
        '▄' => blocks::LOWER_HALF,
        '▀' => blocks::UPPER_HALF,
        '▌' => blocks::LEFT_HALF,
        '▐' => blocks::RIGHT_HALF,
        _ => b'?',
    }
}

pub fn teletext_code_to_ascii(code: u8) -> char {
    match code {
        blocks::FULL_BLOCK => '█',
        blocks::LOWER_HALF => '▄',
        blocks::UPPER_HALF => '▀',
        blocks::LEFT_HALF => '▌',
        blocks::RIGHT_HALF => '▐',
        32..=126 => code as char,
        _ => ' ',
    }
}

pub fn convert_ascii_text_to_codes(input: &str) -> Vec<u8> {
    input.chars().map(ascii_char_to_teletext_code).collect()
}

pub fn convert_codes_to_ascii(codes: &[u8]) -> String {
    codes.iter().copied().map(teletext_code_to_ascii).collect()
}
