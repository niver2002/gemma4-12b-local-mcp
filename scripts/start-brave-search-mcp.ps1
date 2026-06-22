$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"

if (-not (Test-Path $envFile)) {
    throw "Missing .env file at $envFile. Copy .env.example to .env and set BRAVE_API_KEY."
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
        return
    }

    $parts = $line -split "=", 2
    if ($parts.Count -eq 2) {
        [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
    }
}

if (-not $env:BRAVE_API_KEY) {
    throw "BRAVE_API_KEY is not set in $envFile."
}

node (Join-Path $PSScriptRoot "brave-search-mcp.mjs")
