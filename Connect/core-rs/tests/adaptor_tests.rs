use assert_cmd::Command;
use std::fs;
use tempfile::tempdir;

#[test]
fn adaptor_create_list_validate_flow() {
    let home = tempdir().expect("temp home");
    let home_path = home.path();

    let create = Command::cargo_bin("udos-core")
        .expect("binary")
        .env("HOME", home_path)
        .args(["adaptor", "create", "github", "--kind", "sync"])
        .output()
        .expect("create");
    assert!(create.status.success(), "stderr={}", String::from_utf8_lossy(&create.stderr));

    let adaptor_file = home_path
        .join("vault")
        .join("@user/adaptors")
        .join("github.adaptor.yaml");
    assert!(adaptor_file.exists(), "expected {}", adaptor_file.display());

    let list = Command::cargo_bin("udos-core")
        .expect("binary")
        .env("HOME", home_path)
        .args(["adaptor", "list"])
        .output()
        .expect("list");
    assert!(list.status.success());
    let stdout = String::from_utf8_lossy(&list.stdout);
    assert!(stdout.contains("github.adaptor.yaml"), "stdout={stdout:?}");

    let validate = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["adaptor", "validate"])
        .arg(&adaptor_file)
        .output()
        .expect("validate");
    assert!(validate.status.success(), "stderr={}", String::from_utf8_lossy(&validate.stderr));
}

#[test]
fn adaptor_validate_rejects_invalid_version() {
    let temp = tempdir().expect("temp");
    let file = temp.path().join("bad.adaptor.yaml");
    fs::write(
        &file,
        "name: bad\nversion: 0\ndescription: bad adaptor\ncapabilities: [import]\n",
    )
    .expect("write");

    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["adaptor", "validate"])
        .arg(&file)
        .output()
        .expect("run");
    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("version"), "stderr={stderr:?}");
}
