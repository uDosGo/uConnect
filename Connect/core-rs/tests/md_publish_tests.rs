use assert_cmd::Command;
use std::fs;
use tempfile::tempdir;

#[test]
fn md_publish_writes_jekyll_frontmatter_file() {
    let temp = tempdir().expect("temp");
    let src = temp.path().join("entry.md");
    fs::write(&src, "# Surface Note\n\nBridge content").expect("write source");
    let out_dir = temp.path().join("published");

    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args([
            "md",
            "publish",
            src.to_string_lossy().as_ref(),
            "--out-dir",
            out_dir.to_string_lossy().as_ref(),
            "--layout",
            "post",
            "--theme",
            "github-dark",
        ])
        .output()
        .expect("run");

    assert!(
        output.status.success(),
        "stderr={}",
        String::from_utf8_lossy(&output.stderr)
    );
    let published = out_dir.join("surface-note.md");
    assert!(published.exists(), "expected {}", published.display());
    let written = fs::read_to_string(&published).expect("read published");
    assert!(written.contains("layout: post"), "content={written:?}");
    assert!(written.contains("usxd_theme: github-dark"), "content={written:?}");
    assert!(written.contains("Bridge content"), "content={written:?}");
}

