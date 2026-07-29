# Nople - Railway Deployment Plan

## Phase 6: Railway Deployment Files
- [x] Create `.env.example` with all required production environment variables
- [x] Create `nixpacks.toml` at root for Railway build configuration
- [x] Create `Dockerfile` at root (multi-stage build)
- [x] Create `railway.json` for Railway deployment settings
- [x] Create `.dockerignore` to exclude unnecessary files
- [x] Add build scripts to admin/vendor Vite apps (vite build)
- [x] Update medusa-config.ts to enable admin/vendor UI serving in production
- [x] Create deployment guide documentation (DEPLOYMENT.md)
- [x] Commit and push deployment files to GitHub
- [x] Merge deployment files into main branch (PR #2 merged)
- [ ] Guide user through Railway dashboard setup (provision DB + Redis + env vars)
