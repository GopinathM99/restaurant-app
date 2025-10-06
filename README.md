# Srinivas Kitchen Website

A visually rich single-page website concept for **Srinivas Kitchen**, an Indian restaurant experience featuring a hero banner, curated menu highlights, gallery, testimonials, and reservation form.

## Tech Stack
- Static HTML5
- Modern CSS with custom gradients and typography
- Vanilla JavaScript for smooth scrolling, dynamic year display, and Supabase-powered menu rendering

## Getting Started
1. Open `index.html` in your browser, or
2. Serve the site locally (recommended for best font loading) using any static server. For example:
   ```bash
   npx serve .
   ```

## Supabase Setup
1. Create a Supabase project and run the SQL in `docs/supabase-schema.sql` to provision the `menu_items` table and sample rows.
2. Copy `supabase-config.example.js` to `supabase-config.js` and fill in your project's URL and public anon key. (The file is git-ignored to avoid leaking credentials.)
3. Ensure your Supabase Row Level Security policies allow `SELECT` access for the `anon` role.
4. Serve the site locally (`npx serve .`) and the menu will be fetched dynamically from Supabase.

## Customization
- Manage menu content from Supabase — updates appear automatically on page load.
- Replace placeholder storage URLs in Supabase with your own food photography.
- Adjust theme colors via CSS variables at the top of `styles.css`.

## License
This project inherits the MIT License from the repository.
