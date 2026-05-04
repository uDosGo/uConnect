use assert_cmd::Command;

#[test]
fn md_doctor_prints_check_banner() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["md", "doctor"])
        .output()
        .expect("run md doctor");
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("uDos remark pipeline"),
        "stdout={stdout:?}"
    );
    assert!(
        stdout.contains("[ OK ]") || stdout.contains("[FAIL]"),
        "expected status lines, stdout={stdout:?}"
    );
}
