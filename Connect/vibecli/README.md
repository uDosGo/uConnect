# VibeCLI Configuration

This directory contains the configuration for the **Mistral VibeCLI**, which integrates **Le Chat intelligence** and **Mistral MCP CLI** settings.

## Configuration File

The `config.json` file defines the following settings:

### MCP CLI Toolchain
- **GitHub**: Enabled for repo management, PR reviews, and secret scanning.
- **Code Interpreter**: Enabled for spreadsheets, math/calculations, and data analysis.
- **Web/Browsing**: Restricted to up-to-date public figure info and explicit user requests.

### Automation Rules
- **Canvas Mode**: Enabled for structured content (e.g., slides, emails, code, documents).
- **Secret Scanning**: Auto-scan pushed files (excluding `.gitignore`d files).

### File Handling
- **Archival**: Uses `.compost` for versioned files.
- **Formats**: Supports `md`, `json`, `svg`, `html`, `react`, `yaml`, and `xml`.

### Rate Limits
- **Notify**: Enabled to alert users if web/GitHub API quotas are exceeded.
- **Custom**: Allows custom rate limit configurations.
  - **GitHub**: 5000 requests per hour.
  - **Web Search**: 100 requests per minute.

## Usage

1. **Canvas Mode**: Create a Markdown file with slide breaks (`---`) to generate structured content.
   Example:
   ```markdown
   # Sample Canvas
   
   ## Slide 1
   Content for slide 1.
   ---
   
   ## Slide 2
   Content for slide 2.
   ```

2. **Secret Scanning**: Push a file with mock secrets to verify auto-scanning.
   Example:
   ```plaintext
   FAKE_API_KEY=1234567890
   MOCK_PASSWORD=secret123
   ```

3. **GitHub Integration**: Use the GitHub tools for repo management and PR reviews.

## Integration with uDosConnect

The configuration is integrated with the uDosConnect repo via a symbolic link (`vibecli_config.json`) in the root directory.

## Examples

The `examples` folder contains sample files to help you get started:

- **`sample_canvas.md`**: A simple canvas example with slide breaks.
- **`complex_canvas.md`**: A more complex canvas with tables, lists, and Mermaid diagrams.
- **`safe_example.env`**: A mock file for testing secret scanning.

## Extending Configuration

To add more formats or adjust rate limits, edit the `config.json` file and restart the VibeCLI tool.

## Validation

Use the following command to validate the configuration:
```bash
cat config.json | jq .
```

This ensures the JSON is correctly formatted and contains all necessary settings.

## Troubleshooting

### Common Issues

1. **Rate Limit Exceeded**:
   - **Error**: `Error: API rate limit exceeded`
   - **Solution**: Adjust the rate limits in `config.json` or wait for the limit to reset.

2. **Invalid Canvas Format**:
   - **Error**: `Error: Canvas format is invalid`
   - **Solution**: Ensure your Markdown file has correct slide breaks (`---`).

3. **Secret Scanning Failed**:
   - **Error**: `Error: Secret scanning failed`
   - **Solution**: Check the file format and ensure it's not excluded by `.gitignore`.

### Debugging

- **Logs**: Redirect tool output to logs for auditing:
  ```bash
  vibecli github --repo uDosConnect --action list_prs >> vibecli_github.log 2>&1
  ```

- **Alerts**: Use `jq` to parse logs for errors:
  ```bash
  cat vibecli_*.log | jq 'select(.error != null)'
  ```
