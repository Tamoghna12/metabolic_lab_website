# Migration Plan: BioAI Lab Website to Astro + Preact

This plan outlines the steps to migrate the existing vanilla JS and HTML fragment-based website to a modern Astro framework with Preact for interactive components and Markdown for content management.

## Objective
Modernize the website to improve performance, SEO, maintainability, and user experience by leveraging Astro's static site generation and Preact's lightweight reactivity.

## Key Changes
- **Framework**: Migrate to Astro 4.x.
- **Interactivity**: Port forms and API management to Preact.
- **Content**: Convert JSON data to Markdown Content Collections.
- **Structure**: Split the single-page site into dedicated pages for better SEO.
- **Performance**: Shift from client-side component fetching to build-time generation.

## Phased Implementation Plan

### Phase 1: Project Initialization & Infrastructure
1. **Initialize Astro**: Run `npm create astro@latest` (choosing empty template) and add Preact integration `npx astro add preact`.
2. **Directory Restructuring**:
   - Move static assets (images, etc.) to `public/`.
   - Move CSS files to `src/styles/`.
   - Create `src/layouts/BaseLayout.astro`.
3. **Global Styles**: Import existing CSS variables and animations into the `BaseLayout`.

### Phase 2: Content Migration
1. **Define Content Collections**: Create `src/content/config.ts` with schemas for `publications`, `projects`, and `team`.
2. **Markdown Conversion**:
   - Convert `data/publications.json` -> `src/content/publications/*.md`.
   - Convert `data/projects.json` -> `src/content/projects/*.md`.
   - Convert `data/team-members.json` -> `src/content/team/*.md`.

### Phase 3: Layout & Static Components
1. **Base Layout**: Implement `BaseLayout.astro` with the common HTML head, navigation (Header), and Footer.
2. **Astro Components**:
   - Port `components/header.html` -> `src/components/Header.astro`.
   - Port `components/footer.html` -> `src/components/Footer.astro`.
   - Port `components/hero.html` -> `src/components/Hero.astro`.
   - Create `PublicationCard.astro` and `ProjectCard.astro`.

### Phase 4: Preact Components (Interactive)
1. **Grant Generator**: Port `js/forms/GrantGenerator.js` to `src/components/forms/GrantGenerator.jsx` using Preact hooks.
2. **API Key Manager**: Port `js/core/APIKeyManager.js` and `js/ui/APIKeyUI.js` to `src/components/ui/APIKeyManager.jsx`.
3. **Contact Form**: Port `js/forms/ContactForm.js` to `src/components/forms/ContactForm.jsx`.

### Phase 5: Page Construction
1. **Home Page**: `src/pages/index.astro` (Hero, Overview, Featured Projects, News).
2. **Research Page**: `src/pages/research.astro` (Full project list from content collection).
3. **Publications Page**: `src/pages/publications.astro` (Categorized publication list with year filtering).
4. **Team Bio Pages**: `src/pages/team/[id].astro` (Dynamic route generating a page for each member).

### Phase 6: Final Polish & Cleanup
1. **SEO**: Add `Sitemap` and `SEO` component for Meta tags/OpenGraph.
2. **Transitions**: Implement Astro's `ViewTransitions` for smooth navigation.
3. **Legacy Removal**: Remove unused `.html`, `.json`, and old `.js` files once migration is verified.

## Verification & Testing
1. **Build Test**: Run `npm run build` to ensure all pages generate correctly.
2. **Functionality Audit**: 
   - Verify Grant Generator works with selected models.
   - Verify API Key persistence in LocalStorage.
   - Test year filtering on the Publications page.
3. **Lighthouse Audit**: Aim for 95+ in Performance, Accessibility, and SEO.

## Rollback Plan
- The original site will be preserved in a `legacy/` directory or git history.
- The Express server can continue to serve the `dist/` folder after migration.
