use assert_cmd::Command;

#[test]
fn namegen_is_deterministic_for_same_seed() {
    let out1 = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["namegen", "Ada Lovelace"])
        .output()
        .expect("run");
    let out2 = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["namegen", "Ada Lovelace"])
        .output()
        .expect("run");
    assert!(out1.status.success());
    assert!(out2.status.success());
    assert_eq!(out1.stdout, out2.stdout);
}

#[test]
fn namegen_changes_for_different_seeds() {
    let out1 = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["namegen", "Ada Lovelace"])
        .output()
        .expect("run");
    let out2 = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["namegen", "Grace Hopper"])
        .output()
        .expect("run");
    assert!(out1.status.success());
    assert!(out2.status.success());
    assert_ne!(out1.stdout, out2.stdout);
}
