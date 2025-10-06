# Supabase Integration Plan

This document outlines the steps to replace the hard-coded menu data in `index.html` with content served from Supabase.

## 1. Supabase Project Setup
1. **Create project** – Log into Supabase and create a new project. Record the project URL and the `anon` public API key.
2. **Enable storage** – Turn on the Storage feature for hosting menu item images. Create a bucket (e.g., `menu-images`) with public read access and folder structure by category if desired.
3. **Configure database** – Ensure the SQL editor is accessible for schema creation and that Row Level Security (RLS) is enabled (default) for new tables.

## 2. Database Schema & Policies
1. **Table design** – Create a `menu_items` table with columns:
   - `id` (uuid, primary key default `gen_random_uuid()`)
   - `name` (text, required)
   - `description` (text, optional)
   - `price_cents` (integer, required)
   - `category` (text, optional for grouping sections)
   - `image_url` (text, optional)
   - `is_featured` (boolean, default `false` for Chef's Specials)
   - `display_order` (integer, nullable to control ordering)
2. **Sample data** – Insert a handful of menu rows to validate the integration before wiring the frontend.
3. **RLS policies** –
   - Enable `SELECT` for the `anon` role so the public site can read menu items.
   - Restrict `INSERT`, `UPDATE`, `DELETE` to an `service_role` or a custom `authenticated` role that will be used only in the admin UI.

## 3. Client Environment Configuration
1. **Install Supabase JS client** – Add `<script type="module">` to load the `@supabase/supabase-js` CDN bundle or manage via a bundler if the project later moves off static hosting.
2. **Environment variables** – Store the project URL and `anon` key in a `.env` file (if using a build setup) or reference them via a small inline config object that can be swapped per environment. Avoid committing the `service_role` key.

## 4. Frontend Data Fetching
1. **Refactor data source** – Replace the hard-coded menu HTML with a dynamic render step:
   - Add a placeholder container (e.g., `<div id="menu-grid"></div>`).
   - Fetch menu items on page load using the Supabase client (`supabase.from('menu_items').select().order('display_order', { nullsLast: true })`).
   - Build DOM nodes for each item mirroring the existing markup (including background images and price formatting).
2. **Price display helper** – Convert `price_cents` to currency using a JavaScript utility that handles rupee formatting (e.g., `new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`).
3. **Featured section** – Filter or query items with `is_featured = true` to populate the Chef's Specials area while the full menu lists every item.
4. **Loading & error states** – Show a spinner or skeleton UI during fetch, and display a friendly error message if the request fails.

## 5. Admin Management (Phase 2)
1. **Secure admin route** – Create a separate HTML page or admin dashboard protected via Supabase Auth (email/password or magic link).
2. **CRUD actions** – Implement forms that call `insert`, `update`, and `delete` mutations on `menu_items`. Optionally support image uploads to Storage with the returned public URL stored in `image_url`.
3. **Validation** – Enforce required fields and guard against invalid prices or duplicate names.

## 6. Deployment & Maintenance
1. **Build pipeline** – If transitioning to a bundler, ensure environment keys are injected at build time and not hard-coded in version control.
2. **Backup** – Configure Supabase backups and monitor usage quotas (row counts, bandwidth for images).
3. **Monitoring** – Set up Supabase logs or a third-party monitor to track errors and admin actions.

## 7. Rollout Steps
1. Merge the Supabase client integration behind a feature flag or query parameter for testing.
2. Deploy to a staging environment and verify menu rendering, performance, and accessibility.
3. Update documentation (README) with Supabase setup instructions and environment variable names.
4. Remove legacy hard-coded menu markup once the dynamic version is stable.

Following this plan will incrementally replace the static menu with data served from Supabase while keeping room for an authenticated admin workflow in a subsequent iteration.
