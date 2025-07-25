# API Testing Suite

This directory contains automated tests for the API endpoints.

## Available Test Scripts

### Enterprise Test Suite (`api-test-suite.sh`)
Comprehensive testing with detailed reporting, error handling, and multiple output formats.

### Basic Test Suite (`basic-test.sh`)
Basic tests for quick daily testing.

## Features

- **Comprehensive Coverage**: Tests all CRUD operations
- **Colorized Output**: Easy to read results
- **Detailed Reporting**: Success rates and failure analysis
- **Configurable**: Multiple output formats and verbosity levels
- **Logging**: Timestamped results saved to files
- **Health Checks**: Verifies server is running before testing
- **Error Handling**: Graceful failure with helpful messages

## Requirements

- `curl` - For HTTP requests
- `jq` - For JSON formatting (optional, but recommended)

Install on macOS: `brew install curl jq`
Install on Ubuntu: `apt-get install curl jq`

## Exit Codes

- `0` - All tests passed
- `1` - Some tests failed or error occurred

## Output Files

Test results are automatically saved to timestamped log files:
- `test_results_YYYYMMDD_HHMMSS.log`