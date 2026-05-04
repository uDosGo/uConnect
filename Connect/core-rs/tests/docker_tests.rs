use assert_cmd::Command;

#[test]
fn docker_help_is_exposed() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["docker", "--help"])
        .output()
        .expect("run");
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("status"), "stdout={stdout:?}");
    assert!(stdout.contains("compose"), "stdout={stdout:?}");
}

#[test]
fn docker_status_prints_runtime_inventory() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["docker", "status"])
        .output()
        .expect("run");
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("docker:"), "stdout={stdout:?}");
    assert!(stdout.contains("runtime:"), "stdout={stdout:?}");
    assert!(stdout.contains("preferred_runtime:"), "stdout={stdout:?}");
}

#[test]
fn docker_run_without_args_fails_with_guidance() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["docker", "run"])
        .output()
        .expect("run");
    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("missing args"), "stderr={stderr:?}");
}

#[test]
fn docker_status_rejects_invalid_runtime_override() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .env("UDO_DOCKER_RUNTIME", "invalid-runtime")
        .args(["docker", "status"])
        .output()
        .expect("run");
    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("invalid runtime override"), "stderr={stderr:?}");
}
