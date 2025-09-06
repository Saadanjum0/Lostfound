## Lost & Found (Vite + React + Supabase)

Campus Lost & Found platform for reporting, browsing, and messaging about lost/found items.

### Stack
- Vite, React 18, TypeScript
- Tailwind + shadcn/ui
- Supabase (auth, database, storage, realtime)
- React Router v6, React Query v5

### Local development
```sh
npm i
cp .env.example .env.local
# Fill in your Supabase envs inside .env.local
npm run dev
```

Required env variables
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Build
```sh
npm run build
npm run preview
```

### Deploy (Netlify)
- Build command: `npm run build:netlify`
- Publish directory: `dist`
- Environment vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
