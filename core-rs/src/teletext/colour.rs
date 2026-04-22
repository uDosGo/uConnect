pub fn ansi_fg_to_teletext(code: u8) -> Option<u8> {
    match code {
        30 => Some(0),
        31 => Some(1),
        32 => Some(2),
        33 => Some(3),
        34 => Some(4),
        35 => Some(5),
        36 => Some(6),
        37 => Some(7),
        _ => None,
    }
}

pub fn teletext_to_ansi_fg(code: u8) -> Option<u8> {
    match code {
        0 => Some(30),
        1 => Some(31),
        2 => Some(32),
        3 => Some(33),
        4 => Some(34),
        5 => Some(35),
        6 => Some(36),
        7 => Some(37),
        _ => None,
    }
}
