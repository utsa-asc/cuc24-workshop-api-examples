# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Docker-based PHP/MySQL development environment for a Cascade CMS REST API workshop. The project contains:

- **Cascade CMS REST API JavaScript Library** (`app/cascade-restapi.js`) - Client-side JavaScript library for interacting with Cascade CMS REST API
- **Workshop Examples** (`app/examples/`) - HTML examples demonstrating API operations
- **Swagger UI Documentation** (`app/swagger-ui/`) - OpenAPI documentation for the Cascade CMS REST API
- **TinyMCE Integration** (`app/tinymce/`) - Rich text editor for content management

## Development Commands

### Starting the Environment
```bash
docker-compose up -d
```

### Stopping the Environment
```bash
docker-compose down
```

### Accessing the Application
- Web server: http://localhost:8888
- Swagger UI documentation: http://localhost:8888/swagger-ui/

## Architecture

### Docker Services
- **web**: PHP 8.3.3 Apache server serving the application on port 8888
- **db**: MySQL 8.0 database (currently commented out in docker-compose.yml)
- **phpmyadmin**: Database administration interface (commented out)

### Key Components

#### Cascade CMS API Library (`app/cascade-restapi.js`)
- Provides functions for all CRUD operations: `readAsset()`, `editAsset()`, `createAsset()`, `copyAsset()`, `moveAsset()`, `deleteAsset()`
- Additional utilities: `listSubscribers()`, `listSites()`, `copySite()`
- Uses Bearer token authentication with API keys
- Returns Promises for async operations
- Base URL and API key configured at the top of the file

#### Workshop Structure
- **Basic Operations** (`examples/basic-operations/`) - Simple CRUD examples
- **Chained Operations** (`examples/chained-operations/`) - Complex workflows
- **Workshop Scripts** (`examples/workshop-scripts/`) - Bulk operations and data import

#### Configuration
- CMS URL: Currently set to `https://walledev.it.utsa.edu/`
- API Key: Configured in `cascade-restapi.js`
- API endpoints follow pattern: `{cmsUrl}api/v1/{operation}/{type}/{siteName|id}/{path}`

## File Structure Notes

- The MySQL data directory (`mysql-data/`) contains persistent database files
- TinyMCE is included as a complete distribution for rich text editing
- OpenAPI specification (`swagger-ui/openapi.yaml`) documents all available Cascade CMS operations
- Workshop examples include CSV data files for bulk operations

## Development Tips

- The API library uses vanilla JavaScript fetch() - no external dependencies required
- All operations return standardized response objects with success/error status
- Debug mode available by setting `debug: true` in API calls
- The application serves static files directly from the `app/` directory