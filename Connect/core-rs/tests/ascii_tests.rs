use assert_cmd::Command;

#[test]
fn ascii_banner_fallback_without_figlet_on_path() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .env("PATH", "/nonexistent")
        .args(["ascii", "banner", "X"])
        .output()
        .expect("ascii banner");
    assert!(output.status.success(), "stderr={}", String::from_utf8_lossy(&output.stderr));
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains('|') && stdout.contains('X'),
        "expected boxed fallback, stdout={stdout:?}"
    );
}

#[test]
fn ascii_banner_to_teletext_emits_hex_lines() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .env("PATH", "/nonexistent")
        .args(["ascii", "banner", "--to-teletext", "Z"])
        .output()
        .expect("ascii banner");
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("5A") || stdout.contains("20"),
        "expected hex teletext tokens, stdout={stdout:?}"
    );
}

#[test]
fn ascii_fonts_list_returns_ok() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["ascii", "fonts", "list"])
        .output()
        .expect("fonts list");
    assert!(output.status.success(), "stderr={}", String::from_utf8_lossy(&output.stderr));
}

#[test]
fn ascii_fonts_install_stub_ok() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["ascii", "fonts", "install", "myfont"])
        .output()
        .expect("install");
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("stub") || stdout.contains("myfont"), "{stdout:?}");
}
