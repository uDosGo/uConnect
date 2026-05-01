/**
 * Image → ASCII → Teletext pipeline
 * Converts images to ASCII art, then to teletext block characters.
 */
export function imageToAscii(imageData, width = 40, height = 25) {
  // Stub: in production, use a canvas-based brightness mapping
  const chars = '@%#*+=-:. ';
  const result = [];
  for (let y = 0; y < height; y++) {
    let row = '';
    for (let x = 0; x < width; x++) {
      const brightness = ((x + y) * 13 % 256) / 255;
      row += chars[Math.floor(brightness * (chars.length - 1))];
    }
    result.push(row);
  }
  return result;
}

export function asciiToTeletext(asciiLines) {
  // Map ASCII brightness to teletext block characters
  const blocks = [' ', '░', '▒', '▓', '█'];
  return asciiLines.map(line =>
    line.split('').map(ch => {
      const idx = Math.min(ch.charCodeAt(0) % blocks.length, blocks.length - 1);
      return blocks[idx];
    }).join('')
  );
}

export function asciiToGrid(asciiLines) {
  return asciiLines.map(line =>
    line.split('').map(ch => ({
      slot: ch.charCodeAt(0) >= 32 ? ch.charCodeAt(0) : 32,
      char: ch,
      emoji: null,
    }))
  );
}
