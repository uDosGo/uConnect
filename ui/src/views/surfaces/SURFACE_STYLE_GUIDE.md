# UniversalSurfaceXD Style Guide

This document outlines the style standards for UniversalSurfaceXD surfaces to ensure consistency across all surfaces in the uDosGo Connect UI.

## Base Typography Scale

The new udoui base styles provide a consistent typography scale. All surfaces should use these CSS variables:

```css
/* Font Sizes */
--wf-font-xs: 0.75rem;      /* 12px */
--wf-font-sm: 0.875rem;    /* 14px */
--wf-font-md: 1rem;        /* 16px */
--wf-font-lg: 1.125rem;    /* 18px */
--wf-font-xl: 1.25rem;     /* 20px */
--wf-font-2xl: 1.5rem;     /* 24px */
--wf-font-3xl: 2rem;       /* 32px */

/* Colors */
--wf-primary: #2e7d64;     /* Primary brand color */
--wf-secondary: #6b6b6b;   /* Secondary text color */
--wf-text: #1a1a2e;        /* Primary text color */
--wf-text-muted: #b0b0b0;  /* Muted/disabled text */
--wf-border: #e9e9e7;      /* Border color */
--wf-surface: #f7f6f3;     /* Surface background */
--wf-success: #2e7d64;     /* Success state */
--wf-info: #1565c0;        /* Info state */
--wf-warning: #f57c00;     /* Warning state */
--wf-error: #eb5757;       /* Error state */
```

## Spacing Scale

```css
--wf-spacing-1: 0.25rem;   /* 4px */
--wf-spacing-2: 0.5rem;    /* 8px */
--wf-spacing-3: 0.75rem;   /* 12px */
--wf-spacing-4: 1rem;      /* 16px */
--wf-spacing-5: 1.5rem;    /* 24px */
--wf-spacing-6: 2rem;      /* 32px */
--wf-spacing-7: 2.5rem;    /* 40px */
--wf-spacing-8: 3rem;      /* 48px */
```

## Surface Layout Standards

### 1. Surface Container

```css
.surface-container {
  background: rgb(var(--wf-surface));
  color: rgb(var(--wf-text));
  font-family: var(--wf-font-sans);
  padding: var(--wf-spacing-5);
  max-width: 1200px;
  margin: 0 auto;
}
```

### 2. Surface Header

```css
.surface-header {
  margin-bottom: var(--wf-spacing-5);
  padding-bottom: var(--wf-spacing-3);
  border-bottom: 2px dashed rgb(var(--wf-border));
}

.surface-header h1 {
  font-size: var(--wf-font-xl);
  font-weight: bold;
  color: rgb(var(--wf-primary));
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--wf-spacing-3);
}

.surface-tagline {
  color: rgb(var(--wf-secondary));
  font-size: var(--wf-font-sm);
  margin: 0 0 var(--wf-spacing-1);
}
```

### 3. Navigation Elements

```css
.surface-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px dashed rgb(var(--wf-border));
  padding: var(--wf-spacing-3) var(--wf-spacing-4);
  margin-bottom: var(--wf-spacing-5);
}

.surface-nav-link {
  font-size: var(--wf-font-sm);
  color: rgb(var(--wf-text-muted));
  cursor: pointer;
  padding: var(--wf-spacing-1) 0;
  border-bottom: 2px dashed transparent;
}

.surface-nav-link:hover {
  color: rgb(var(--wf-text));
}

.surface-nav-link.active {
  color: rgb(var(--wf-primary));
  border-bottom-color: rgb(var(--wf-primary));
}
```

### 4. Card Components

```css
.surface-card {
  border: 2px dashed rgb(var(--wf-border));
  overflow: hidden;
}

.surface-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--wf-spacing-3) var(--wf-spacing-4);
  border-bottom: 1px dashed rgb(var(--wf-border));
}

.surface-card-header h3 {
  margin: 0;
  font-size: var(--wf-font-sm);
  font-weight: bold;
  color: rgb(var(--wf-text));
  text-transform: uppercase;
  letter-spacing: 1px;
}

.surface-card-content {
  padding: var(--wf-spacing-4);
}
```

### 5. Text Elements

```css
.surface-text {
  font-size: var(--wf-font-sm);
  color: rgb(var(--wf-secondary));
  margin: 0 0 var(--wf-spacing-3);
}

.surface-text-link {
  font-size: var(--wf-font-xs);
  color: rgb(var(--wf-primary));
  cursor: pointer;
  border-bottom: 1px dashed rgb(var(--wf-primary));
  text-decoration: none;
}

.surface-text-link:hover {
  opacity: 0.8;
}
```

### 6. Status Indicators

```css
.surface-status {
  font-size: var(--wf-font-xs);
  padding: var(--wf-spacing-1) var(--wf-spacing-3);
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.status-up {
  color: #4caf50;
}

.status-degraded {
  color: #ff9800;
}

.status-down {
  color: #f44336;
}
```

## Component-Specific Standards

### GitHub Surface

```css
/* Repository Cards */
.repo-card {
  background: rgb(var(--wf-surface));
  border: 1px solid rgb(var(--wf-border));
  border-radius: 8px;
  padding: var(--wf-spacing-4);
  transition: all 0.2s;
  cursor: pointer;
}

.repo-card:hover {
  background: rgb(var(--wf-surface));
  border-color: rgb(var(--wf-primary));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.repo-name {
  font-size: var(--wf-font-md);
  font-weight: 600;
  margin: 0;
}

.repo-description {
  font-size: var(--wf-font-sm);
  color: rgb(var(--wf-secondary));
  margin-bottom: var(--wf-spacing-3);
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--wf-spacing-2);
  padding: var(--wf-spacing-2) var(--wf-spacing-4);
  background: rgb(var(--wf-primary));
  color: white;
  border: none;
  border-radius: 6px;
  font-size: var(--wf-font-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: rgb(var(--wf-primary));
  opacity: 0.9;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--wf-spacing-2);
  padding: var(--wf-spacing-2) var(--wf-spacing-4);
  background: rgb(var(--wf-surface));
  color: rgb(var(--wf-text));
  border: 1px solid rgb(var(--wf-border));
  border-radius: 6px;
  font-size: var(--wf-font-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgb(var(--wf-surface));
  border-color: rgb(var(--wf-primary));
}
```

### WordPress Surface

```css
/* Post Cards */
.post-card {
  background: rgb(var(--wf-surface));
  border: 1px solid rgb(var(--wf-border));
  border-radius: 8px;
  padding: var(--wf-spacing-4);
  margin-bottom: var(--wf-spacing-3);
}

.post-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--wf-spacing-2);
}

.post-title {
  font-size: var(--wf-font-lg);
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.post-status {
  font-size: var(--wf-font-xs);
  padding: var(--wf-spacing-1) var(--wf-spacing-3);
  border-radius: 4px;
}

.status-published {
  background: rgba(46, 125, 100, 0.1);
  color: rgb(var(--wf-success));
}

.status-draft {
  background: rgba(245, 124, 0, 0.1);
  color: rgb(var(--wf-warning));
}
```

## Font Size Comparison

### Old UniversalSurfaceXD Font Sizes (Oversized)
- h1: 1.5rem (24px) - Too large
- h2: 1.25rem (20px) - Too large
- h3: 1rem (16px) - Too large
- body text: 0.875rem (14px) - Too large
- small text: 0.75rem (12px) - Too large

### New udoui Font Sizes (Recommended)
- h1: var(--wf-font-xl) (20px) - ✓ Correct
- h2: var(--wf-font-lg) (18px) - ✓ Correct
- h3: var(--wf-font-md) (16px) - ✓ Correct
- body text: var(--wf-font-sm) (14px) - ✓ Correct
- small text: var(--wf-font-xs) (12px) - ✓ Correct

## Color Palette Consistency

All surfaces should use the same color variables:

```css
/* Primary Colors */
--wf-primary: #2e7d64;     /* Green (brand) */
--wf-secondary: #6b6b6b;   /* Gray */
--wf-text: #1a1a2e;        /* Dark blue */
--wf-text-muted: #b0b0b0;  /* Light gray */
--wf-border: #e9e9e7;      /* Light border */
--wf-surface: #f7f6f3;     /* Light background */
--wf-success: #4caf50;     /* Success green */
--wf-info: #2196f3;        /* Info blue */
--wf-warning: #ff9800;     /* Warning orange */
--wf-error: #f44336;       /* Error red */
```

## Implementation Checklist

- [ ] All surfaces use CSS variables from udoui base styles
- [ ] Font sizes are consistent with typography scale
- [ ] Colors use the shared palette
- [ ] Spacing uses the spacing scale
- [ ] Surface containers have consistent padding
- [ ] Status indicators use standardized classes
- [ ] Buttons follow the button style guide
- [ ] Cards have consistent border styling
- [ ] Navigation elements use consistent styling

## Migration Steps

1. **Identify all surfaces** using the old style guide
2. **Replace hardcoded values** with CSS variables
3. **Update font sizes** to use the typography scale
4. **Standardize colors** using the shared palette
5. **Apply spacing scale** consistently
6. **Test across different surfaces** for visual consistency
7. **Update documentation** to reflect new standards

## Verification

After applying these standards, verify:
- All surfaces have consistent font sizes
- Color usage is uniform across surfaces
- Spacing is consistent throughout
- Status indicators are easily recognizable
- Navigation elements follow the same pattern