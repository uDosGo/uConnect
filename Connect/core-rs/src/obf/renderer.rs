use crate::obf::parser::OBFBlock;

pub fn render_terminal(blocks: &[OBFBlock]) -> String {
    let mut out = String::new();
    for block in blocks {
        out.push_str(&format!("[{}]\n", block.id));
        for line in &block.lines {
            out.push_str(line);
            out.push('\n');
        }
        out.push('\n');
    }
    out
}

pub fn render_html(blocks: &[OBFBlock]) -> String {
    let mut out = String::from("<div class=\"obf\">\n");
    for block in blocks {
        out.push_str(&format!("  <section id=\"{}\">\n", block.id));
        for line in &block.lines {
            out.push_str(&format!("    <p>{}</p>\n", html_escape(line)));
        }
        out.push_str("  </section>\n");
    }
    out.push_str("</div>\n");
    out
}

fn html_escape(input: &str) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}
