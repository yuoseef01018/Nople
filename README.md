<!-- PROJECT LOGO -->
<p align="center">
  <a href="https://github.com/yuoseef01018/Nople">
   <img src="apps/vendor/public/logo.svg" width="120" alt="Nople" />
  </a>

  <h3 align="center">Nople</h3>

  <p align="center">
   The open-source B2B marketplace for coffee suppliers. A coffee trade platform.
    <br />
    <a href="#getting-started"><strong>Getting Started</strong></a>
    &middot;
    <a href="#coffee-profile">Coffee Profile</a>
    &middot;
    <a href="#seed-data">Seed Data</a>
  </p>
</p>

<!-- ABOUT THE PROJECT -->

<div align="center">
  <!-- Shields.io Badges -->
  <a href="https://github.com/yuoseef01018/Nople/tree/main?tab=MIT-1-ov-file">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg" />
  </a>
  <a href="https://github.com/yuoseef01018/Nople/issues/new/choose">
    <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" />
  </a>
  <img alt="Platform" src="https://img.shields.io/badge/platform-B2B%20Coffee-orange.svg" />
  <img alt="Colors" src="https://img.shields.io/badge/colors-Navy%20%2B%20Vanilla-1b2a4a.svg" />
</div>

## What is Nople

**Nople** is an open-source, headless B2B marketplace platform built for the global coffee trade. It connects coffee producers, estates, cooperatives, and roasters with wholesale buyers — roasters, cafés, distributors, and importers — in a single multi-vendor marketplace. Each supplier gets their own dashboard and public profile page to showcase their farm, origin, certifications, roasting capabilities, and product catalog.

Nople is built on top of [Mercur](https://github.com/mercurjs/mercur), the open-source multi-vendor marketplace engine, which itself stands on [Medusa.js](https://medusajs.com/). This means you inherit a mature, battle-tested commerce core — catalog, orders, payments, shipping, tax, and stock — plus the marketplace layer (vendor onboarding, multi-vendor catalogs, offers, commissions, and payouts), customized end-to-end for the coffee industry.

### Why Nople for coffee

- **Built for coffee suppliers**: Every vendor profile carries coffee-specific fields — farm type, geographic region, altitude, organic certifications, roasting capabilities, processing methods, and harvest season — so buyers can evaluate origin and quality at a glance.
- **B2B wholesale by default**: Multi-variant products by weight (250g, 500g, 1kg, 5kg, 25kg), bulk pricing, and sample request flows designed for trade buyers, not retail shoppers.
- **Navy + Vanilla identity**: A calm, professional visual identity in deep navy (`#1B2A4A`) and warm vanilla (`#F3E9D2`) with coffee accents (`#6F4E37`) — a palette that feels premium and trade-appropriate across admin and vendor panels.
- **Own your marketplace, no fees**: Self-host on your own infrastructure with full source access. No percentage of GMV, no per-transaction cut, no vendor lock-in.
- **Headless and customizable**: TypeScript, event-driven, and API-first — serve any storefront or frontend, extend or override workflows through a composable architecture.
- **Standing on Medusa**: Inherit catalog, orders, payments, shipping, tax, and stock from a mature commerce core, with the marketplace layer added on top.

### Built With

- [Medusa.js](https://medusajs.com/)
- [Mercur](https://github.com/mercurjs/mercur)
- [TypeScript](https://www.typescriptlang.org/)
- [React.js](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

## Architecture

Nople is modular. Each piece is a separate, independently deployable app that talks to the core over APIs.

- **Nople Core**: the marketplace engine on top of Medusa, with vendors, commissions, payouts, and multi-vendor primitives — customized with coffee-specific seller metadata.
- **Admin Panel**: marketplace operators manage vendors, catalog, categories, commissions, and rules. Branded as "Nople Admin" with the Navy + Vanilla theme.
- **Vendor Panel**: coffee suppliers manage their products, orders, and payouts, and maintain their coffee profile (farm, region, certifications, roasting). Branded as "Nople Vendor Hub" with the Navy + Vanilla theme.
- **Storefronts**: customer-facing B2B apps with multi-vendor browsing, cart, and checkout (build your own using the headless API).

## Coffee Profile

Every coffee supplier on Nople has a rich, coffee-specific profile stored in the seller `metadata` field (no database migrations required). The profile is edited through the Vendor Panel under **Settings → Store → Coffee Profile** and displayed on the store detail page sidebar.

The coffee profile captures the information coffee buyers care about most:

| Field | Description | Example |
| --- | --- | --- |
| **Farm Type** | The kind of operation the supplier runs | Large Estate, Smallholder Co-op, Micro-Mill, Direct Trade |
| **Region / Origin** | Geographic origin of the coffee | Yirgacheffe, Ethiopia |
| **Altitude (masl)** | Growing altitude in meters above sea level | 1800-2200 |
| **Organic Certifications** | Certifications held | USDA Organic, Fair Trade, Rainforest Alliance |
| **Roasting Capabilities** | What the supplier can roast and ship | Green Beans Only, Light, Medium, Medium-Dark, Dark, Custom |
| **Processing Methods** | How the cherry is processed | Washed, Natural, Honey, Anaerobic, Wet-Hulled |
| **Harvest Season** | When the coffee is harvested | Nov-Feb (main), Jun-Aug (fly) |

Because these fields live in the seller `metadata` JSON field — which the `UpdateSeller` API already accepts as `z.record(z.unknown())` — the coffee profile works without any backend changes or database migrations. The vendor panel reads from and writes to `seller.metadata`, merging with any existing metadata to avoid overwriting other fields.

## Seed Data

Nople ships with a coffee-specific seed script (`apps/api/src/scripts/seed-nople-coffee.ts`) that creates a realistic starting point for a coffee marketplace.

### Coffee Categories

- **Arabica Beans** — single-origin Arabica green and roasted beans
- **Robusta Beans** — Robusta for espresso blends and instant
- **Blended Roasts** — house and custom blends
- **Ground Coffee** — pre-ground for cafés and foodservice
- **Coffee Equipment** — brewing and roasting equipment for trade buyers

### Sample Products

Each product includes multiple variants by weight (250g, 500g, 1kg, 5kg, 25kg) with USD and EUR pricing, stock levels, and Unsplash coffee photography:

- **Ethiopia Yirgacheffe Arabica** — washed, light roast, single-origin
- **Brazil Santos Arabica** — natural process, medium roast
- **Vietnam Robusta** — wet-hulled, dark roast, espresso-grade
- **Nople House Blend** — medium-dark, balanced blend
- **Espresso Ground** — fine grind, pre-ground for foodservice

### Regions, Stock & Shipping

- **Region** with coffee-producing and consuming countries (Egypt, Saudi Arabia, UAE, Yemen, Ethiopia, Brazil, Vietnam, USA, UK, Germany)
- **Stock Location** — "Nople Coffee Hub" in Cairo, Egypt
- **Shipping Options** — Standard Coffee Shipping and Express Cold Chain

Run the seed with:

```sh
cd apps/api
npx medusa exec src/scripts/seed-nople-coffee.ts
```

## Visual Identity

Nople uses a **Navy + Vanilla** color palette across both the admin and vendor panels, defined in CSS custom properties:

| Token | Hex | Use |
| --- | --- | --- |
| `--nople-navy` | `#1B2A4A` | Primary, sidebar, headers, buttons |
| `--nople-vanilla` | `#F3E9D2` | Backgrounds, accents, text on navy |
| `--nople-coffee` | `#6F4E37` | Secondary accent, coffee iconography |

The theme files (`packages/admin/src/nople-theme.css` and `packages/vendor/src/nople-theme.css`) override the Medusa UI primary color, sidebar background, and button styles. A custom coffee-bean logo (`apps/vendor/public/logo.svg` and `apps/admin-test/public/logo.svg`) replaces the default branding.

## Deployment

Because Nople is a plain Node.js application backed by PostgreSQL and Redis, it deploys the same way whether you ship it as a container, orchestrate it with Kubernetes, push it to a managed cloud, or lock it inside an air-gapped network. There's no proprietary runtime to adopt and no hosting tier you're forced onto, so where your marketplace lives and where its data sits stay entirely under your control. Prefer a managed backend? Nople also deploys to [Medusa Cloud](https://medusajs.com/pricing/) with push-to-deploy and auto-scaling.

## License

This repository is licensed under the [MIT License](./LICENSE) and is fully open source. Nople is a coffee-industry customization of [Mercur](https://github.com/mercurjs/mercur), the open-source marketplace engine built on [Medusa](https://medusajs.com/).

<!-- GETTING STARTED -->

## Getting Started

To get a local coffee marketplace up and running, please follow these simple steps.

### Prerequisites

Here's what you need to run Nople.

- Node.js (Version: >=20.x)
- PostgreSQL (Version: >=13.x)
- Redis
- Bun _(recommended)_

> If you want to enable any of the available integrations (e.g. Stripe Connect payouts, Resend email, Algolia/Meilisearch search), you may want to obtain additional credentials for each one and add them to your `.env` file.

### Setup

1. Create a new Nople project (or clone this repo)

   ```sh
   bun create mercur-app@latest my-coffee-marketplace
   ```

   Then apply the Nople customizations (branding, theme, coffee profile, seed data) from this repository.

2. Start the development server

   ```sh
   cd my-coffee-marketplace
   bun run dev
   ```

3. Seed the coffee data

   ```sh
   cd apps/api
   npx medusa exec src/scripts/seed-nople-coffee.ts
   ```

4. Access your coffee marketplace
   - Backend API: `http://localhost:9000`
   - Admin Panel: `http://localhost:9000/dashboard`
   - Vendor Panel: `http://localhost:9000/seller`

   Your marketplace comes seeded with a demo coffee store out of the box — a ready-to-go seller with a full catalog of coffee products and offers, so you can explore the admin and vendor panels immediately.

## Roadmap & Suggestions

Nople is designed to grow into a full coffee trade platform. Planned and suggested directions:

- **Vendor rating & review system** — let buyers rate suppliers on bean quality, consistency, shipping, and communication, with aggregate scores on the vendor profile page.
- **Sample request flow** — a lightweight RFQ-style flow where buyers request sample bags (50g–250g) before committing to a bulk order, tracked as a sample order with its own status.
- **B2B wholesale pricing tiers** — volume-based price breaks per product (e.g. 1kg = $X, 5kg = 10% off, 25kg = 20% off), displayed clearly on product and vendor pages.
- **Arabic localization** — full Arabic (`ar`) translations for the admin and vendor panels, including RTL layout support, so the platform serves the MENA coffee trade natively.
- **Origin traceability** — link each product lot to its farm, altitude, and harvest date, with a public traceability view for buyers.
- **Cupping scores & tasting notes** — store cupping scores, flavor descriptors, and roast dates on each product variant.
- **Contract & pre-harvest ordering** — forward contracts where buyers commit to buying a harvest before it ships, with milestone tracking.

## Contribution

Nople is an Open Source project and we encourage everyone to help us make it better. If you are interested in contributing, please read the [Contributing Guide](https://github.com/mercurjs/mercur/blob/main/CONTRIBUTING.md) and [Code of Conduct](https://github.com/mercurjs/mercur/blob/main/CODE_OF_CONDUCT.md).

If you have any questions about contributing, feel free to [open an issue](https://github.com/yuoseef01018/Nople/issues/new/choose) on GitHub.

Discovered a bug or have a feature suggestion? Feel free to [create an issue](https://github.com/yuoseef01018/Nople/issues/new/choose).

## Acknowledgements

Nople is built on top of [Mercur](https://github.com/mercurjs/mercur) by the Mercur team, which stands on [Medusa.js](https://medusajs.com/). Huge thanks to both projects for the open-source foundation that makes Nople possible.
