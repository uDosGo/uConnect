use assert_cmd::Command;
use predicates::prelude::*;
use std::fs;
use tempfile::tempdir;

#[test]
fn teletext_convert_and_render_work() {
    let tmp = tempdir().expect("tmpdir");
    let ascii = tmp.path().join("sample.txt");
    let ttx = tmp.path().join("sample.ttx");
    fs::write(&ascii, "ABC\n█").expect("ascii source");

    Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["teletext", "convert"])
        .arg(&ascii)
        .args(["--output"])
        .arg(&ttx)
        .assert()
        .success()
        .stdout(predicate::str::contains("Converted"));

    assert!(ttx.exists(), "ttx output should exist");

    Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["teletext", "render"])
        .arg(&ttx)
        .args(["--mode", "terminal"])
        .assert()
        .success()
        .stdout(predicate::str::contains("TELETEXT"));
}

#[test]
fn teletext_grid_render_writes_ttx() {
    let tmp = tempdir().expect("tmpdir");
    let grid = tmp.path().join("grid.obf");
    let ttx = tmp.path().join("grid.ttx");
    fs::write(&grid, "##..\n..##").expect("grid source");

    Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["teletext", "grid", "render"])
        .arg(&grid)
        .args(["--output"])
        .arg(&ttx)
        .assert()
        .success()
        .stdout(predicate::str::contains("Grid rendered"));

    assert!(ttx.exists(), "grid render output should exist");
}
