# udoui Font Catalogue

This directory contains the curated font collection for the udoui ecosystem, extracted from the Vendor directory and organized by category.

## Structure

```
fonts/
├── catalogue.json      # Master manifest with license info
├── README.md           # This file
├── retro/              # Retro & teletext fonts
│   ├── Teletext50.*    # Teletext-style pixel font
│   ├── press-start-2p  # NES-inspired pixel font
│   ├── C64_User_Mono   # Commodore 64 monospace
│   ├── giana.*         # Retro gaming font
│   └── PetMe*          # Commodore PET/C64 font family
├── modern/             # Modern & classic fonts
│   ├── ChicagoFLF      # Classic Mac system font
│   ├── SF-Pro          # Apple system font
│   ├── Quicksand       # Geometric sans-serif
│   └── ...             # 15+ additional fonts
└── themes/             # Theme-specific fonts
    └── mallard*        # Retro display font family
```

## Usage

### Via CLI (planned)
```bash
udo font list            # List all available fonts
udo font install <name>  # Install a font to system
udo font preview <name>  # Preview a font
```

### Via CSS (local development)
```css
@font-face {
  font-family: 'Teletext50';
  src: url('/fonts/retro/Teletext50.woff2') format('woff2');
}
```

### Via CDN (planned)
```css
@font-face {
  font-family: 'Teletext50';
  src: url('https://cdn.udo.space/fonts/retro/Teletext50.woff2') format('woff2');
}
```

## License Compliance

All fonts include proper attribution and licensing information in `catalogue.json`. Please respect the individual licenses when distributing.
