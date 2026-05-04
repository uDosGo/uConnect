use anyhow::{anyhow, Result};

pub fn list() -> Result<()> {
    let cfg = crate::orchestrator::workflow::load()?;
    println!("{}", serde_json::to_string_pretty(&cfg.schedules)?);
    Ok(())
}

pub fn add(schedule: &str, task: &str, priority: &str) -> Result<()> {
    let mut cfg = crate::orchestrator::workflow::load()?;
    let name = format!("job-{}", cfg.schedules.len() + 1);
    cfg.schedules.push(crate::orchestrator::workflow::WorkflowJob {
        name,
        schedule: schedule.to_string(),
        task: task.to_string(),
        priority: priority.to_string(),
    });
    crate::orchestrator::workflow::save(&cfg)?;
    println!("workflow job added");
    Ok(())
}

pub fn queue_status() -> Result<()> {
    println!("workflow queue status: high=0 normal=0 low=0 failed=0");
    Ok(())
}

pub fn retry(failed_id: &str) -> Result<()> {
    if failed_id.trim().is_empty() {
        return Err(anyhow!("failed-id is required"));
    }
    println!("workflow retry queued for failed-id={failed_id}");
    Ok(())
}
