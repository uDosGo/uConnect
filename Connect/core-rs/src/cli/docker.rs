use anyhow::{anyhow, Result};
use std::env;
use std::process::Command;

pub fn status() -> Result<()> {
    let docker = runtime_version("docker");
    let podman = runtime_version("podman");
    let preferred = env::var("UDO_DOCKER_RUNTIME")
        .ok()
        .or_else(|| env::var("UOS_RUNTIME").ok())
        .unwrap_or_else(|| "auto".to_string());
    let selected = select_runtime()?;

    match (&docker, &podman) {
        (Ok(d), Ok(p)) => {
            println!("docker: {d}");
            println!("podman: {p}");
            println!("runtime: {}", selected.unwrap_or_else(|| "none".to_string()));
        }
        (Ok(d), Err(_)) => {
            println!("docker: {d}");
            println!("podman: unavailable");
            println!("runtime: {}", selected.unwrap_or_else(|| "none".to_string()));
        }
        (Err(_), Ok(p)) => {
            println!("docker: unavailable");
            println!("podman: {p}");
            println!("runtime: {}", selected.unwrap_or_else(|| "none".to_string()));
        }
        (Err(_), Err(_)) => {
            println!("docker: unavailable");
            println!("podman: unavailable");
            println!("runtime: none");
        }
    }
    println!("preferred_runtime: {preferred}");

    Ok(())
}

pub fn run_passthrough(args: &[String]) -> Result<()> {
    exec_passthrough("run", args)
}

pub fn compose_passthrough(args: &[String]) -> Result<()> {
    exec_passthrough("compose", args)
}

fn exec_passthrough(subcommand: &str, args: &[String]) -> Result<()> {
    if args.is_empty() {
        return Err(anyhow!(
            "missing args for `udo docker {subcommand}` (use `udo docker {subcommand} -- <args...>`)"
        ));
    }
    let runtime = select_runtime()?;
    let runtime = runtime.ok_or_else(|| {
        anyhow!("neither docker nor podman is available on PATH (cannot run `udo docker {subcommand}`)")
    })?;

    let mut cmd = Command::new(&runtime);
    cmd.arg(subcommand);
    for arg in args {
        cmd.arg(arg);
    }
    let status = cmd.status()?;
    if !status.success() {
        return Err(anyhow!(
            "{} {} exited with status {}",
            runtime,
            subcommand,
            status
        ));
    }
    Ok(())
}

fn select_runtime() -> Result<Option<String>> {
    if let Some(requested) = preferred_runtime()? {
        if runtime_version(&requested).is_ok() {
            return Ok(Some(requested));
        }
        return Err(anyhow!(
            "requested runtime is not available on PATH: {}",
            requested
        ));
    }
    if runtime_version("docker").is_ok() {
        return Ok(Some("docker".to_string()));
    }
    if runtime_version("podman").is_ok() {
        return Ok(Some("podman".to_string()));
    }
    Ok(None)
}

fn preferred_runtime() -> Result<Option<String>> {
    let raw = env::var("UDO_DOCKER_RUNTIME")
        .ok()
        .or_else(|| env::var("UOS_RUNTIME").ok())
        .unwrap_or_else(|| "auto".to_string());
    let norm = raw.trim().to_ascii_lowercase();
    match norm.as_str() {
        "" | "auto" => Ok(None),
        "docker" => Ok(Some("docker".to_string())),
        "podman" => Ok(Some("podman".to_string())),
        _ => Err(anyhow!(
            "invalid runtime override `{}` (expected auto|docker|podman via UDO_DOCKER_RUNTIME or UOS_RUNTIME)",
            raw
        )),
    }
}

fn runtime_version(binary: &str) -> Result<String> {
    let out = Command::new(binary).arg("--version").output()?;
    if !out.status.success() {
        return Err(anyhow!("{binary} --version failed"));
    }
    Ok(String::from_utf8_lossy(&out.stdout).trim().to_string())
}
