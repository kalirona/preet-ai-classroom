# Coolify Deployment Hardening Checklist

## Pre-Deployment

- [ ] Set all required env vars in Coolify:
  - `DATABASE_URL` (PostgreSQL connection string)
  - `SESSION_SECRET` (min 32 chars, use `openssl rand -hex 64`)
  - `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
  - `PAYPAL_ENVIRONMENT` = `production`
  - `PAYPAL_WEBHOOK_ID`
  - `GEMINI_API_KEY` (optional)
  - `NODE_ENV` = `production`
- [ ] Run `npm run migrate` to seed initial data (first deploy only)

## Security

- [ ] PostgreSQL connection uses SSL (`sslmode=require` in DATABASE_URL)
- [ ] Database user has minimum required permissions (read/write on `public` schema, no DDL)
- [ ] Regenerate demo passwords before production launch
- [ ] Remove or disable `/auth/google-simulated` route (simulated OAuth, not production-ready)
- [ ] Verify CSP headers in browser DevTools
- [ ] Verify HSTS header present: `curl -I https://yourdomain.com | grep Strict-Transport-Security`

## Backup & DR

- [ ] Schedule `scripts/backup.ps1` via Coolify cron (daily recommended)
- [ ] Store backups off-server (S3, Backblaze B2, or Coolify S3-compatible storage)
- [ ] Test restore procedure: `pg_restore --dbname=<DATABASE_URL> --format=custom <backup_file>`
- [ ] Document RTO (Recovery Time Objective) and RPO (Recovery Point Objective)

## Monitoring

- [ ] Enable Coolify health check: `GET /api/database/status`
- [ ] Set up uptime monitoring (Pingdom, Better Uptime, or Coolify built-in)
- [ ] Configure error alerting (email/Slack via Coolify notification channels)
- [ ] Monitor rate limit headers in production (`RateLimit-Remaining` in responses)

## Performance

- [ ] Verify PostgreSQL connection pool max (20) matches Coolify DB connection limit
- [ ] Enable query logging for slow queries (`log_min_duration_statement = 1000` in postgresql.conf)
- [ ] Consider PgBouncer for connection pooling if scaling beyond 20 connections
- [ ] Analyze query performance: `EXPLAIN ANALYZE` on frequent queries

## Production Hardening

- [ ] Verify `trust proxy` setting matches Coolify proxy setup (default 1 is fine for single proxy)
- [ ] Ensure `Secure` flag on cookies (automatic when NODE_ENV=production)
- [ ] Confirm CSP allows necessary CDN resources (PayPal, images, fonts)
- [ ] Test PayPal webhook: post sample event to `/api/payments/webhook`
- [ ] Verify rate limiting works: `curl -X POST -d '{}' https://yourdomain.com/api/auth/login`
- [ ] Enable PostgreSQL SSL: `sslmode=require` in DATABASE_URL
- [ ] Set `PGSSLMODE=require` env var for SSL enforcement

## Post-Deployment Verification

- [ ] Login as admin, verify session persists
- [ ] Create a workspace, verify multi-tenant isolation
- [ ] Test role assignment: promote user to moderator, verify permissions
- [ ] Make a test payment via PayPal (sandbox first, then production)
- [ ] Verify audit logs appear for sensitive actions
- [ ] Check `/api/database/status` returns `connected: true`
- [ ] Run `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` to verify crypto works
