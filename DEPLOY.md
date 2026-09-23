# Deploy Guide — AI Resume Analyzer

Architecture: frontend on **Vercel**, backend + **MongoDB on one VPS** you control, HTTPS via **Caddy**.

```
Browser ──► Vercel (React app)
                │   https://api.your-domain.com  (VITE_API_URL)
                ▼
            Caddy (automatic HTTPS) ──► 127.0.0.1:5000 ──► Express
                                                              │
                                            mongodb://localhost:27017/resumeai
```

## 1. Vercel → backend URL env var (REQUIRED)

Without this the deployed site calls `localhost:5000` (the browser's own machine) and everything fails.

- Open the Vercel project → **Settings → Environment Variables**
- Add:
  - Key `VITE_API_URL`, value `https://api.your-domain.com`, scope **Production**
- Redeploy.

## 2. MongoDB on the VPS

```bash
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

Enable auth (recommended):

```bash
mongosh
use admin
db.createUser({ user: "resumeuser", pwd: "<strong-password>", roles: ["root"] })
exit
```

Then edit `/etc/mongod.conf` → set `security.authorization: enabled`, restart:

```bash
sudo systemctl restart mongod
```

## 3. App files on the VPS

```bash
sudo mkdir -p /opt/resumeai/server
sudo chown -R $USER:$USER /opt/resumeai
# copy the `server/` folder from this repo into /opt/resumeai/server
cd /opt/resumeai/server
npm install
```

Edit `/opt/resumeai/server/config/config.env`:

```env
PORT=5000
MONGO_URI=mongodb://resumeuser:<strong-password>@localhost:27017/resumeai
jwt_secret=<change to a long random string>
jwt_refresh_secret=<change to a different long random string>
jwt_expire=15m
jwt_refresh_expire=7d
NODE_ENV=production
GROQ_API_KEY=<your key>
ALLOWED_ORIGINS=https://your-app.vercel.app
```

**Auth model:** short-lived `accessToken` cookie (default `jwt_expire`, 15 min) plus a long-lived httpOnly `refreshToken` cookie (7 days, scoped to `/auth`). The client automatically calls `POST /auth/refresh` when the access token expires and retries the failed request. Only `/auth/*` endpoints see the refresh cookie.

## 4. Run the backend (pick one)

**PM2:**

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**systemd:**

```bash
sudo cp resumeai.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now resumeai
```

Check it started with `pm2 logs resumeai-server` or `journalctl -u resumeai` → you should see `Connected to MongoDB` and `Main server running on 5000`.

Note: the server stores uploaded resumes in `server/uploads/` — make sure that folder is writable by the run user.

## 5. HTTPS with Caddy (REQUIRED for login to work)

The auth cookie is `Secure` cross-site, so the backend MUST be served over HTTPS.

1. Point a DNS record `api.your-domain.com` → your VPS public IP.
2. Edit `/opt/resumeai/server/Caddyfile` with your real domain.
3. Install Caddy and run:

```bash
sudo apt install -y caddy
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl enable --now caddy
```

Caddy automatically gets an HTTPS cert. Verify: open `https://api.your-domain.com/` → should show `Main server working`.

## 6. Frontend on Vercel

- Vercel project root = `airesume/resume-analyze/client`
- Build command `npm run build`, output dir `dist`
- The local `.env` (`VITE_API_URL=http://localhost:5000`) is gitignored and does NOT apply to Vercel — the env var from step 1 is what counts.

## 7. Smoke test checklist

- [ ] `https://your-app.vercel.app` loads with the violet theme
- [ ] Sign up on Vercel domain → no error toast, gets redirected in
- [ ] Upload a resume → analysis appears; history saves
- [ ] Log out → cookie cleared; protected pages redirect to /Login
- [ ] `https://api.your-domain.com/` returns `Main server working`
- [ ] Backend log shows `Connected to MongoDB`

## Common failures

| Symptom | Cause / fix |
|---|---|
| Login/register 401, or works then "logged in" ignored | `VITE_API_URL` not set on Vercel, or backend not on HTTPS, or `ALLOWED_ORIGINS` missing the exact Vercel URL |
| Server won't boot (`ERR_SOCKET_BAD_PORT`) | trailing `;` in `PORT` in config.env — keep `PORT=5000` clean |
| Uploads 500 | `uploads/` not writable by the backend user |
| `Not allowed by CORS` | requested origin isn't in `ALLOWED_ORIGINS` |