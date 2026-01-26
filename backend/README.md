# Retail Boss POS - Backend

FastAPI backend for the Retail Boss POS system.

## Architecture

This backend follows a clean architecture pattern:

```
HTTP Request → Routes → Services → Repositories → Supabase Database
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## Setup

### Prerequisites

- Python 3.11+
- Supabase project

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure your Supabase credentials in `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BACKEND_PORT=8000
```

3. Run database migrations:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the migration file: `supabase/migrations/001_initial_schema.sql`

## Running the Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI entrypoint
│   ├── core/                   # System configuration
│   ├── api/v1/                 # API routes
│   ├── services/               # Business logic
│   ├── repositories/           # Data access
│   ├── schemas/                # Pydantic models
│   ├── utils/                  # Utility functions
│   └── tests/                  # Test files
├── supabase/
│   └── migrations/             # Database migrations
├── .env.example                # Environment variables template
├── requirements.txt            # Python dependencies
├── ARCHITECTURE.md             # Architecture documentation
└── README.md                   # This file
```

## API Endpoints

All endpoints are under `/api/v1/`:

- **Auth**: `/api/v1/auth/login`
- **Products**: `/api/v1/products` (CRUD)
- **Inventory**: `/api/v1/inventory/*` (stock management)
- **Billing**: `/api/v1/bills` (bill creation)

See http://localhost:8000/docs for interactive API documentation.

## Testing

```bash
# Run tests
pytest app/tests/
```

## Deployment

### Docker

Build and test the Docker image locally:

```bash
# Build image
docker build -t pos-backend .

# Run container
docker run -p 8000:8000 \
  -e SUPABASE_URL=your-supabase-url \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key \
  -e CORS_ORIGINS=http://localhost:3000 \
  pos-backend
```

### GCP Cloud Run

For detailed deployment instructions to Google Cloud Platform, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick deploy:

```bash
# Linux/Mac
./deploy.sh YOUR_PROJECT_ID

# Windows PowerShell
.\deploy.ps1 -ProjectId YOUR_PROJECT_ID
```

## Development

### Code Style

- Follow PEP 8
- Use type hints
- Document functions with docstrings

### Key Principles

1. **No business logic in routes** - Routes only handle HTTP
2. **Business logic in services** - All rules and validation
3. **Data access in repositories** - Database operations only
4. **Immutable operations** - Bills and inventory movements are immutable

## License

MIT

