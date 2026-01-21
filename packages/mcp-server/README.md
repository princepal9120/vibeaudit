# VibeAudit MCP Server

Model Context Protocol (MCP) server for VibeAudit security scanning. Enables Claude Desktop and other MCP clients to scan repositories and URLs for security vulnerabilities.

## Available Tools

### `scan_repo`
Scan a GitHub repository for security vulnerabilities.
- **Input:** `repositoryUrl` (required), `branch` (optional), `waitForCompletion` (optional)
- **Output:** Scan ID and status, or full results if `waitForCompletion: true`

### `scan_url`
Scan a live web application (DAST).
- **Input:** `url` (required, HTTPS only), `waitForCompletion` (optional)
- **Output:** Scan ID and status, or full results if `waitForCompletion: true`

### `get_report`
Get detailed security report for a completed scan.
- **Input:** `scanId` (required), `includeLowSeverity` (optional), `maxFindings` (optional)
- **Output:** Security score, findings with explanations and fix recommendations

### `list_scans`
List your security scans.
- **Input:** `status` (optional), `page` (optional), `limit` (optional)
- **Output:** Paginated list of scans with basic info

## Setup

### 1. Build the MCP Server

```bash
# From the project root
npm install
npm run build:mcp
```

### 2. Configure Claude Desktop

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vibeaudit": {
      "command": "node",
      "args": ["/path/to/vibeaudit/packages/mcp-server/dist/index.js"],
      "env": {
        "VIBEAUDIT_API_URL": "https://api.vibeaudit.dev",
        "VIBEAUDIT_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

After updating the config, restart Claude Desktop to load the MCP server.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VIBEAUDIT_API_URL` | Yes | `http://localhost:3001` | VibeAudit API URL |
| `VIBEAUDIT_API_KEY` | No | - | API key for authentication |
| `VIBEAUDIT_REQUEST_TIMEOUT` | No | `30000` | Request timeout in ms |
| `VIBEAUDIT_POLL_INTERVAL` | No | `2000` | Scan status poll interval in ms |
| `VIBEAUDIT_MAX_WAIT_TIME` | No | `180000` | Max wait time for scan completion |

## Development

```bash
# Run in development mode with hot reload
npm run dev:mcp

# Test with MCP Inspector
npm run mcp:inspect
```

## Example Usage in Claude

Once configured, you can ask Claude to:

- "Scan my GitHub repo at https://github.com/owner/repo for security issues"
- "Check the security of https://myapp.com"
- "Show me the report for scan abc123"
- "List my recent security scans"
