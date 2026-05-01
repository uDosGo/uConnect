/**
 * Monodraw CLI — wraps monodraw.app shell commands for grid import
 */
export async function monodrawImport(filePath) {
  // In production: spawn `monodraw export <file> --format svg`
  // For now, simulate with the expected SVG structure
  try {
    const cmd = `monodraw export "${filePath}" --format svg 2>/dev/null`;
    // In browser context, this would require an API endpoint
    // For now, return a stub
    return { success: true, format: 'svg', data: `<!-- Monodraw export of ${filePath} -->` };
  } catch {
    return { success: false, error: 'Monodraw CLI not available' };
  }
}

export async function monodrawToList(filePath) {
  try {
    const cmd = `monodraw export "${filePath}" --format text 2>/dev/null`;
    return { success: true, format: 'text', data: `<!-- Monodraw text export of ${filePath} -->` };
  } catch {
    return { success: false, error: 'Monodraw CLI not available' };
  }
}
