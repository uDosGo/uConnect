fn main() {
  tauri_build::build();
  
  // Manually copy frontend assets to ensure they're bundled
  println!("cargo:rerun-if-changed=../dist");
  
  // Copy the entire dist folder to the target directory
  let output_dir = std::env::var("OUT_DIR").unwrap();
  let dist_path = std::path::Path::new("../dist");
  let target_dist_path = std::path::Path::new(&output_dir).join("dist");
  
  if dist_path.exists() {
    // Remove existing target dist if it exists
    if target_dist_path.exists() {
      std::fs::remove_dir_all(&target_dist_path).ok();
    }
    
    // Copy the entire dist folder
    copy_dir_all(dist_path, &target_dist_path).unwrap();
  }
}

fn copy_dir_all(src: &std::path::Path, dst: &std::path::Path) -> std::io::Result<()> {
  std::fs::create_dir_all(dst)?;
  
  for entry in std::fs::read_dir(src)? {
    let entry = entry?;
    let ty = entry.file_type()?;
    
    if ty.is_dir() {
      copy_dir_all(&entry.path(), &dst.join(entry.file_name()))?;
    } else {
      std::fs::copy(&entry.path(), &dst.join(entry.file_name()))?;
    }
  }
  
  Ok(())
}