use assert_cmd::Command;
use std::fs;
use tempfile::tempdir;
#[cfg(unix)]
use std::os::unix::fs::PermissionsExt;

#[test]
fn import_status_reports_markdownify_state() {
    let output = Command::cargo_bin("udos-core")
        .expect("binary")
        .args(["import-status"])
        .output()
        .expect("run import-status");

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("\"ok\""),
        "expected json status payload, stdout={stdout:?}"
    );
}

#[cfg(unix)]
#[test]
fn import_command_writes_output_with_mock_markitdown_runtime() {
    let temp = tempdir().expect("temp dir");
    let root = temp.path();

    let server_path = root.join("vendor/markdownify-mcp/dist/index.js");
    let markitdown_path = root.join("vendor/markdownify-mcp/.venv/bin/markitdown");
    let config_path = root.join("markdownify-config.yaml");
    let input_path = root.join("input.txt");
    let output_path = root.join("out.md");

    fs::create_dir_all(server_path.parent().expect("server parent")).expect("mkdir server path");
    fs::create_dir_all(markitdown_path.parent().expect("markitdown parent"))
        .expect("mkdir markitdown path");
    fs::write(&server_path, "// mock server").expect("write mock server");
    fs::write(&input_path, "hello from test input").expect("write input");

    let script = "#!/usr/bin/env bash\necho '# converted by mock markitdown'\ncat \"$1\"\n";
    fs::write(&markitdown_path, script).expect("write mock markitdown");
    let mut perms = fs::metadata(&markitdown_path).expect("metadata").permissions();
    perms.set_mode(0o755);
    fs::set_permissions(&markitdown_path, perms).expect("chmod");

    let config = format!(
        "markdownify:\n  enabled: true\n  server_path: \"{}\"\n  uv_path: null\n  capabilities:\n    - txt-to-markdown\n",
        server_path.display()
    );
    fs::write(&config_path, config).expect("write config");

    Command::cargo_bin("udos-core")
        .expect("binary")
        .env("UDOS_MARKDOWNIFY_CONFIG", config_path.to_string_lossy().to_string())
        .args([
            "import",
            input_path.to_string_lossy().as_ref(),
            "--output",
            output_path.to_string_lossy().as_ref(),
        ])
        .assert()
        .success();

    let output = fs::read_to_string(&output_path).expect("read output");
    assert!(
        output.contains("# converted by mock markitdown"),
        "expected mock conversion header in output, output={output:?}"
    );
    assert!(
        output.contains("hello from test input"),
        "expected input content in output, output={output:?}"
    );
}
