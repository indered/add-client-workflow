# Add Client Workflow

## Overview

Add Client Workflow is a Vite React dashboard for advisors who need to add clients, track intake progress, and start quick plans.

### Live app

- Production URL: https://add-client-workflow.vercel.app
- GitHub repo: https://github.com/indered/add-client-workflow

## What Is Included

### Frontend stack

- React 19
- TypeScript
- Vite
- HeroUI
- Tailwind CSS

### Dashboard

- Summary cards for total clients, invited clients, active intakes, completed intakes, and quick plans.
- A table view for all clients with status, intake type, step, progress, and activity dates.
- A mobile-ready client list for smaller screens.

### Add client workflow

- Send a full intake link to a client.
- Create a quick plan with a shorter form.
- Fill the full intake on the client's behalf.
- No auth, database, analytics, or backend services yet.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

The app runs on `http://127.0.0.1:5173` unless Vite picks another open port.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Project Structure

### Main files

- `src/App.tsx` contains the dashboard, sample client data, filters, and add-client modal.
- `src/main.tsx` mounts the React app.
- `src/styles.css` loads Tailwind CSS and global styles.
- `vite.config.ts` configures Vite and Tailwind.
- `index.html` sets the page shell and title.

## Available Scripts

### Development

- `npm run dev` starts the local Vite dev server.

### Production

- `npm run build` runs TypeScript checks and creates the production build.
- `npm run preview` serves the built app locally.

## Deployment

### Current deploy

- Hosted on Vercel.
- Production branch is `main`.
- Public production alias is `https://add-client-workflow.vercel.app`.

### Deploy note

- Vercel SSO protection was disabled for this public bootstrap project so the live app can be viewed without a login.

## Next Steps

### Suggested pointers

- Replace the starter screen with the real client workflow.
- Add route structure when the app needs more than one screen.
- Add form state and validation before saving client data.
- Add a backend only when the workflow needs persistent data.
