use assert_cmd::Command;

#[test]
fn vector_status_and_plan_are_exposed() {
    let status = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["vector", "status"])
        .output()
        .expect("status");
    assert!(status.status.success());
    let out = String::from_utf8_lossy(&status.stdout);
    assert!(out.contains("Vector lane status"), "stdout={out:?}");

    let plan = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["vector", "plan"])
        .output()
        .expect("plan");
    assert!(plan.status.success());
    let out = String::from_utf8_lossy(&plan.stdout);
    assert!(out.contains("Vector lane plan"), "stdout={out:?}");
}

#[test]
fn vector_benchmark_stub_echoes_inputs() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args([
            "vector",
            "benchmark",
            "--dataset",
            "wp-posts-1k",
            "--backend",
            "pgvector",
        ])
        .output()
        .expect("benchmark");
    assert!(output.status.success());
    let out = String::from_utf8_lossy(&output.stdout);
    assert!(out.contains("wp-posts-1k"), "stdout={out:?}");
    assert!(out.contains("pgvector"), "stdout={out:?}");
}
