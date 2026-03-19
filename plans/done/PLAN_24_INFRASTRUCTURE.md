# PLAN 24: Infrastructure Setup

**Status**: Pending
**Depends on**: Nothing
**Goal**: PostgreSQL + all npm deps running from zero.

---

## Steps

### 1. Create `docker-compose.yml` at repo root

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: intelliqe_postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: admin
      POSTGRES_DB: postgres
    volumes:
      - intelliqe_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped
volumes:
  intelliqe_pgdata:
    name: intelliqe_pgdata
```

### 2. Start PostgreSQL
```bash
docker-compose up -d
```

### 3. Fallback (if Docker unavailable)
- `choco install postgresql16` or Windows installer
- `ALTER USER postgres PASSWORD 'admin';`

### 4. npm install at root
```bash
npm install
```

### 5. npm install in website/ (AFTER Plan 25 rename)
```bash
cd website/frontend && npm install
cd ../backend && npm install
```

---

## Verification
- `docker-compose ps` shows postgres healthy
- `psql -U postgres -h localhost -c "SELECT 1;"` (password: admin)
- `npm list` works in root, website/frontend, website/backend
