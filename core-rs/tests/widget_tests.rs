use assert_cmd::Command;
use std::fs;
use tempfile::tempdir;

#[test]
fn widget_create_list_and_test_flow() {
    let home = tempdir().expect("temp home");
    let home_path = home.path();

    let create = Command::cargo_bin("udos-core")
        .expect("binary")
        .env("HOME", home_path)
        .args(["widget", "create", "health-gauge", "--lang", "js"])
        .output()
        .expect("create");
    assert!(
        create.status.success(),
        "stderr={}",
        String::from_utf8_lossy(&create.stderr)
    );

    let widget_file = home_path
        .join("vault")
        .join("@toybox/widgets")
        .join("health-gauge.js");
    assert!(widget_file.exists(), "expected {}", widget_file.display());

    let list = Command::cargo_bin("udos-core")
        .expect("binary")
        .env("HOME", home_path)
        .args(["widget", "list"])
        .output()
        .expect("list");
    assert!(list.status.success());
    let listed = String::from_utf8_lossy(&list.stdout);
    assert!(listed.contains("health-gauge.js"), "stdout={listed:?}");

    let test_ok = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["widget", "test"])
        .arg(&widget_file)
        .output()
        .expect("test");
    assert!(test_ok.status.success(), "stderr={}", String::from_utf8_lossy(&test_ok.stderr));
}

#[test]
fn widget_test_fails_when_missing_onrender() {
    let temp = tempdir().expect("temp");
    let file = temp.path().join("bad-widget.js");
    fs::write(&file, "export default class BadWidget { async onInit() {} }").expect("write");

    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["widget", "test"])
        .arg(&file)
        .output()
        .expect("run");
    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("missing onRender"), "stderr={stderr:?}");
}
