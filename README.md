# OTL Engine

The public-facing website engine for [OTL CMS](https://otl.studio). Built with Next.js 16, React 19, and Tailwind CSS 4.

## Getting Started

Click **"Use this template"** on GitHub to create your own private copy, then:

```bash
npm install
cp .env.example .env
# Add your SITE_ACCESS_TOKEN to .env
npm run dev
```

> **Why not fork?** GitHub requires forks of public repositories to be public. Since your site contains custom code and configuration, use the template button instead to keep your repository private.

## Automatic Updates

This repository includes a GitHub Action (`.github/workflows/sync-engine.yml`) that checks daily for new stable OTL Engine releases. When an update is available, it automatically creates a pull request in your repository so you can review and merge the changes.

## Documentation

Visit [otl.studio](https://otl.studio) for full documentation.
