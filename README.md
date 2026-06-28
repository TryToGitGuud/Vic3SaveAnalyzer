# Vic3 Save Analyzer

Victoria 3 save stats analyzer made by TryToGitGud.

Vic3 Save Analyzer is a local Windows tool for reading Victoria 3 `.v3` saves and displaying country/player statistics, graphs, laws, technologies, state breakdowns, buildings, budgets, debt, GDP, population, literacy, SoL, radicals and loyalists.

## Quick Start

1. Download and extract the folder.
2. Run `GitGudSaveAnalyzer.exe`.
3. Open a Victoria 3 `.v3` save from the app.

The launcher opens the app at:

```txt
http://127.0.0.1:4173/
```

## Requirements

- Windows 10/11
- A browser

The launcher installs missing runtime dependencies with `winget` when needed:

- Node.js LTS
- Python 3

Docker is not required.

## Project Layout

```txt
GitGudSaveAnalyzer.exe   Main launcher
README.md               This file
app/                    Application and converter
```

## Notes

- Saves are processed locally.
- Binary Victoria 3 saves are converted locally through `vic3_melt.py` and `rakaly.dll`.
- Victoria 3 visual assets belong to Paradox Interactive and are included only for local compatibility/styling.

## License

Source code is intended for MIT licensing. Third-party assets and binaries remain under their own licenses.
