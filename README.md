# BioAI Lab Website

An academic website template for the BioAI Lab featuring modular components, JSON-driven content, a Tailwind-inspired glassmorphic design system, and optional Node.js backend integration.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server (optional backend):
   ```bash
   npm run dev
   ```
3. Open `index.html` in a browser or serve the project using your preferred static server.

## Deployment

### GitHub Pages

This repository includes a GitHub Actions workflow that publishes the site to GitHub Pages.

1. Ensure the default branch is named `main` (or update `.github/workflows/pages.yml` to match your branch).
2. In the repository settings on GitHub, enable **Pages** and set the source to **GitHub Actions**.
3. Push changes to the `main` branch (or trigger the workflow manually with **Run workflow**).
4. The workflow uploads the entire repository as a static artifact and publishes it to GitHub Pages. Your site will be available at the URL reported in the workflow summary.

For alternative hosting environments or running the optional API server, see `docs/DEPLOYMENT.md`.

## Front-end design language

- The site loads reusable HTML components at runtime and hydrates them with JSON data (news, projects, team, testimonials, publications).
- Tailwind CSS Play CDN powers utility spacing (`py-24`, etc.), while bespoke CSS in `css/` provides the glassmorphism palette, reveal animations, and component styling used for dynamic content.
- Intersection Observer-based reveal animations and keyword rotators live in `js/main.js`; search results are debounced in `js/search.js`.

## Project Structure

Refer to the repository tree for directories including styles, scripts, HTML components, JSON data, static assets, backend server files, documentation, and tests.

## Contributing

Please read `docs/CONTRIBUTING.md` for contribution guidelines.
