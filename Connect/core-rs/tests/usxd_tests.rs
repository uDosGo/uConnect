use assert_cmd::Command;
use predicates::prelude::*;
use std::fs;
use tempfile::tempdir;

#[test]
fn usxd_render_modes_route_correctly() {
    let tmp = tempdir().expect("tmpdir");
    let surface = tmp.path().join("surface.json");
    fs::write(
        &surface,
        r#"{"name":"demo","regions":[{"title":"Header","content":"Hello"}]}"#,
    )
    .expect("surface file");

    for mode in ["teletext", "mono", "wireframe"] {
        Command::cargo_bin("udos-core")
            .expect("binary")
            .args(["usxd", "render"])
            .arg(&surface)
            .args(["--mode", mode])
            .assert()
            .success()
            .stdout(predicate::str::contains("USXD Surface: demo"));
    }
}
