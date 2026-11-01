# Carewell Hospital Management

A small hospital operations dashboard built with plain HTML, CSS, and JavaScript. Supabase handles email-link sign-in and the patients/appointments database. There is no frontend framework or build step.

## Start

Open `index.html` from a static server (or deploy this folder to Vercel). Without Supabase configured, the interface uses clearly labelled fictional preview data.

## Connect Supabase

1. Create a Supabase project.
2. Run [`supabase.sql`](supabase.sql) in the project SQL Editor.
3. In the app, choose **Connect Supabase** and enter the project URL and publishable key (or legacy anon key). The values are stored in this browser's local storage; use only the public browser key, never a service-role key.
4. In Supabase Auth settings, allow the deployed site URL as a redirect URL. Add staff emails in Supabase Auth if email sign-in is restricted.
5. Sign in with a hospital email. Supabase sends an email link.

The database schema grants authenticated users access to both starter tables for simplicity. Set up role-specific policies and review privacy/security requirements before storing real patient records. Demo records are fictional and are never written to Supabase.

## Deploy

Deploy the project root as a static site on Vercel. No build command is required; the output directory is the project root.
