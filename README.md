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

## Updating

To update your engine to the latest stable version:

```bash
npx @otl-core/cli upgrade
```

This fetches the changes between your current version and the latest release, applies them as a patch, and preserves your customizations. Review the changes, resolve any conflicts, then commit.

## Documentation

Visit [otl.studio](https://otl.studio) for full documentation.
