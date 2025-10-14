# Deployment Guide

## GitHub Pages

The repository is preconfigured with `.github/workflows/pages.yml` to deploy straight to GitHub Pages.

1. Ensure your default branch is `main` (or edit the workflow trigger to match your branch).
2. In the GitHub repository settings, enable **Pages** with **GitHub Actions** as the source.
3. Push commits to `main` or run the workflow manually to publish the latest static assets.
4. The action uploads the project root (including `index.html`, `css/`, `js/`, `components/`, and `data/`) as the Pages artifact and makes it available at the Pages URL shown in the workflow output.

## Alternative hosting / backend

1. Install dependencies with `npm install`.
2. Build or prepare static assets if needed.
3. Deploy the repository to your preferred static hosting provider or run the Node.js server with `npm run dev` for dynamic API responses.
4. Configure environment variables such as `PORT` if deploying the optional backend.
