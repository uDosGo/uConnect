use assert_cmd::Command;

#[test]
fn image_styles_lists_mono_presets() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["image", "styles"])
        .output()
        .expect("run");
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("mono_teletext"), "stdout={stdout:?}");
    assert!(stdout.contains("mono_blueprint"), "stdout={stdout:?}");
}

#[test]
fn image_render_rejects_forbidden_mono_terms() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args([
            "image",
            "render",
            "--prompt",
            "draw grey lines over semi-transparent shadows",
        ])
        .output()
        .expect("run");
    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("forbidden term"), "{stderr}");
}
