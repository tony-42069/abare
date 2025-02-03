# ABARE Platform

ABARE (AI-Based Analysis of Real Estate) is a comprehensive platform for commercial real estate analysis, underwriting, and document management.

## Project Structure

```
abare-platform/
├── apps/                    # Application packages
│   ├── web/                # Main Next.js web application
│   ├── api/                # FastAPI backend
│   └── docs/               # Documentation site
├── packages/               # Shared packages
│   ├── core/               # Core types and utilities
│   ├── analytics/          # Financial analysis engine
│   ├── market-data/        # Market data services
│   ├── eslint-config/      # Shared ESLint configuration
│   └── typescript-config/  # Shared TypeScript configuration
└── tools/                  # Build and development tools
```

## Packages

### Core (@abare/core)
Contains shared types, interfaces, and utilities used across the platform.

### Analytics (@abare/analytics)
Financial analysis engine for CRE investment calculations.

### Market Data (@abare/market-data)
Services for fetching and managing market data, including:
- Treasury rates
- SOFR rates
- Market spreads
- Cap rates

## Development

### Prerequisites
- Node.js >= 18
- pnpm >= 9.0.0

### Setup
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Start development servers
pnpm run dev
```

### Commands
- `pnpm run build`: Build all packages
- `pnpm run dev`: Start development servers
- `pnpm run lint`: Run linting
- `pnpm run clean`: Clean build artifacts

## Architecture

### Frontend
- Next.js for the main web application
- React components with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling

### Backend
- FastAPI for the main API
- MongoDB for data storage
- Redis for caching
- Celery for background tasks

### Integration Points
- Document processing with OCR
- Financial analysis engine
- Market data integration
- Real-time updates

## Contributing
1. Create a new branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License
Private - All rights reserved
