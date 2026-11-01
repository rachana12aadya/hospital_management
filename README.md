# Carewell Hospital Management

A small hospital operations dashboard built with plain HTML, CSS, and JavaScript. Supabase provides email-link sign-in and the patients/appointments database. There is no frontend framework or build step.

## Start

Open `index.html` from a static server. The production deployment is on Vercel. `supabase-config.js` contains only the browser-safe Supabase publishable key; never put a service-role key in frontend code.

## Database

The Supabase project and starter tables are configured. [`supabase.sql`](supabase.sql) documents the schema and access policies. Authenticated staff can access the starter tables. Review role-specific policies and privacy/security requirements before storing real patient records. The preview contains six fictional patients and seven sample appointments for trying the dashboard. Preview changes stay in memory and are never written to Supabase.

## Authentication

Only existing Supabase staff accounts can sign in; the app does not allow new users to self-register. Add staff accounts in Supabase Auth, then sign in with the matching hospital email. The Vercel production URL is configured as the Supabase site URL and redirect URL.

## Deploy

Vercel deploys commits from the `main` branch. No build command is required; the project root is the output directory.
