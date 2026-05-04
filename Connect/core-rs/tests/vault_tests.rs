use assert_cmd::Command;
use predicates::prelude::*;
use std::fs;
use tempfile::tempdir;

#[test]
fn vault_init_and_list_work() {
    let tmp = tempdir().expect("tmpdir");
    let vault = tmp.path().join("vault");

    Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["init", "--path"])
        .arg(&vault)
        .assert()
        .success()
        .stdout(predicate::str::contains("Initialized vault"));

    Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["list", "--path"])
        .arg(&vault)
        .args(["--depth", "2"])
        .assert()
        .success()
        .stdout(predicate::str::contains("content"))
        .stdout(predicate::str::contains(".compost"))
        .stdout(predicate::str::contains("system"));
}

#[test]
fn vault_delete_restore_search_work() {
    let tmp = tempdir().expect("tmpdir");
    let vault = tmp.path().join("vault");
    let content = vault.join("content");
    let note = content.join("note.md");

    Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["init", "--path"])
        .arg(&vault)
        .assert()
        .success();

    fs::create_dir_all(&content).expect("content dir");
    fs::write(&note, "hello usxd world\nanother line").expect("seed note");

    Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["search", "usxd", "--path"])
        .arg(&vault)
        .assert()
        .success()
        .stdout(predicate::str::contains("content/note.md"));

    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["delete"])
        .arg(&note)
        .assert()
        .success()
        .get_output()
        .stdout
        .clone();
    let output = String::from_utf8(output).expect("utf8");
    let id = output
        .trim()
        .split("id=")
        .nth(1)
        .expect("id part")
        .trim()
        .to_string();

    assert!(!note.exists(), "note should be moved to compost");

    Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["restore", &id, "--path"])
        .arg(&vault)
        .assert()
        .success()
        .stdout(predicate::str::contains("Restored"));

    assert!(note.exists(), "note should be restored");
}
