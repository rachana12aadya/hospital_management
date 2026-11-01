# Carewell Hospital Management

A small hospital operations dashboard built with plain HTML, CSS, and JavaScript. Supabase provides email-link sign-in and the patients/appointments database. There is no frontend framework or build step.

## Start

Open `index.html` from a static server. The production deployment is on Vercel. `supabase-config.js` contains only the browser-safe Supabase publishable key; never put a service-role key in frontend code.

## Database

The Supabase project and starter tables are configured. [`supabase.sql`](supabase.sql) documents the schema and access policies. Authenticated staff can access the starter tables. Review role-specific policies and privacy/security requirements before storing real patient records. The preview contains six fictional patients and seven sample appointments for trying the dashboard. Preview changes stay in memory and are never written to Supabase.

## Authentication

Only existing Supabase staff accounts can sign in; the app does not allow new users to self-register. Add staff accounts in Supabase Auth, then sign in with the matching hospital email. The Vercel production URL is configured as the Supabase site URL and redirect URL.

## Admin availability

Open `/admin` to manage recurring doctor availability. `supabase-admin.sql` creates the doctor and availability tables, read/write policies, realtime publication, and fictional schedule rows. The migration grants admin rights to `rachana12aadya@gmail.com`. Admin edits require a Supabase Auth password for that confirmed account; the admin password is never stored in frontend code. Password recovery links open a password update form on the main dashboard. Availability changes stream to active sessions through Supabase Realtime. `vercel.json` routes `/admin` to the static admin page.

## Deploy

Vercel deploys commits from the `main` branch. No build command is required; the project root is the output directory.
