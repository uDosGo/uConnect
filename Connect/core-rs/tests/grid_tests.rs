use assert_cmd::Command;
use predicates::prelude::*;
use std::fs;
use tempfile::tempdir;

#[test]
fn grid_import_export_outputs_files() {
    let tmp = tempdir().expect("tmpdir");
    let xp = tmp.path().join("map.xp");
    let obf = tmp.path().join("map.obf");
    let xp_out = tmp.path().join("map.out.xp");
    fs::write(&xp, b"xp-stub-bytes").expect("xp input");

    Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["grid", "import"])
        .arg(&xp)
        .args(["--out"])
        .arg(&obf)
        .assert()
        .success()
        .stdout(predicate::str::contains("Imported"));

    assert!(obf.exists(), "obf output should exist");

    Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["grid", "export"])
        .arg(&obf)
        .args(["--format", "xp", "--out"])
        .arg(&xp_out)
        .assert()
        .success()
        .stdout(predicate::str::contains("Exported"));

    assert!(xp_out.exists(), "xp output should exist");
}
