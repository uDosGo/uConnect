use assert_cmd::Command;
use std::io::Write;
use tempfile::NamedTempFile;

#[test]
fn run_eval_prints_output() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["run", "--eval", r#"PRINT "hello""#])
        .output()
        .expect("run");
    assert!(output.status.success(), "stderr={}", String::from_utf8_lossy(&output.stderr));
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("hello"), "stdout={stdout:?}");
}

#[test]
fn run_file_executes() {
    let mut tmp = NamedTempFile::new().expect("tmp");
    writeln!(tmp, r#"PRINT "from-file""#).expect("write");
    let path = tmp.path().to_path_buf();

    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["run", "--file"])
        .arg(&path)
        .output()
        .expect("run");
    assert!(output.status.success(), "stderr={}", String::from_utf8_lossy(&output.stderr));
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("from-file"), "stdout={stdout:?}");
}

#[test]
fn run_markdown_file_executes_ucode_fences_in_order() {
    let mut tmp = NamedTempFile::with_suffix(".md").expect("tmp");
    write!(
        tmp,
        "# Demo\n\nNot executed.\n\n```ucode\nLET name = \"friend\"\nPRINT \"hello ${{name}}\"\n```\n\n```text\nPRINT \"ignored\"\n```\n\n```uCode\nPRINT \"again ${{name}}\"\n```\n"
    )
    .expect("write");
    let path = tmp.path().to_path_buf();

    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["run", "--file"])
        .arg(&path)
        .output()
        .expect("run");
    assert!(
        output.status.success(),
        "stderr={}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("hello friend"), "stdout={stdout:?}");
    assert!(stdout.contains("again friend"), "stdout={stdout:?}");
    assert!(!stdout.contains("ignored"), "stdout={stdout:?}");
}

#[test]
fn run_markdown_file_accepts_ucode_fence_with_attributes() {
    let mut tmp = NamedTempFile::with_suffix(".md").expect("tmp");
    write!(
        tmp,
        "# Attr fence\n\n```ucode {{linenos=true}}\nPRINT \"attr-ok\"\n```\n"
    )
    .expect("write");
    let path = tmp.path().to_path_buf();

    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["run", "--file"])
        .arg(&path)
        .output()
        .expect("run");
    assert!(output.status.success(), "stderr={}", String::from_utf8_lossy(&output.stderr));
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("attr-ok"), "stdout={stdout:?}");
}

#[test]
fn run_markdown_file_fails_without_ucode_fence() {
    let mut tmp = NamedTempFile::with_suffix(".md").expect("tmp");
    write!(tmp, "# No fences\n\nJust prose.\n").expect("write");
    let path = tmp.path().to_path_buf();

    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["run", "--file"])
        .arg(&path)
        .output()
        .expect("run");
    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("no ```ucode fences found"), "{stderr}");
}

#[test]
fn run_eval_handles_utf8_bom_prefix() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["run", "--eval", "\u{feff}PRINT \"bom-ok\""])
        .output()
        .expect("run");
    assert!(output.status.success(), "stderr={}", String::from_utf8_lossy(&output.stderr));
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("bom-ok"), "stdout={stdout:?}");
}

#[test]
fn fmt_trims_and_writes_newline() {
    let mut tmp = NamedTempFile::with_suffix(".ucode").expect("tmp");
    write!(tmp, "PRINT \"x\"   \n  \n").expect("write");
    let path = tmp.path().to_path_buf();

    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["fmt"])
        .arg(&path)
        .output()
        .expect("fmt");
    assert!(output.status.success(), "stderr={}", String::from_utf8_lossy(&output.stderr));

    let content = std::fs::read_to_string(&path).expect("read");
    assert!(!content.contains("   "));
    assert!(content.ends_with('\n'));
}

#[test]
fn fmt_check_fails_when_would_change() {
    let mut tmp = NamedTempFile::with_suffix(".ucode").expect("tmp");
    write!(tmp, "PRINT \"y\"   ").expect("write");
    let path = tmp.path().to_path_buf();

    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["fmt", "--check"])
        .arg(&path)
        .output()
        .expect("fmt");
    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("would reformat") || stderr.contains("reformat"), "{stderr}");
}
