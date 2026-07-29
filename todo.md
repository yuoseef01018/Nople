# Nople - Coffee Suppliers Marketplace Conversion Plan

## Phase 1: Branding & Identity
- [x] Change app name to "Nople" across the codebase (package.json files, titles, metadata)
- [x] Update README with Nople branding and coffee marketplace description
- [x] Create new color theme (Navy + Vanilla) in admin panel
- [x] Create new color theme (Navy + Vanilla) in vendor panel
- [x] Update page titles, favicons, meta tags
- [x] Replace all "Mercur" references in en.json (vendor + admin)

## Phase 2: Coffee-Specific Data Model
- [x] Add coffee seed data (categories: Arabica, Robusta, beans, ground)
- [x] Add coffee measurement units (kg, gram) - via product variants by weight
- [x] Add sample coffee products
- [x] Customize seller/vendor profile with coffee-specific fields (farm type, region, organic certifications, roasting)
  - [x] Create coffee profile form (store-coffee-profile-form.tsx)
  - [x] Create coffee profile display section (store-coffee-profile-section.tsx)
  - [x] Create route page (coffee-profile/index.tsx)
  - [x] Register route in get-route-map.tsx
  - [x] Wire section into store-detail-page.tsx
  - [x] Add i18n strings (en.json + ar.json) for store.coffeeProfile.*

## Phase 3: Storefront Customization
- [x] Update storefront with coffee-themed colors and images (Navy + Vanilla theme applied across admin + vendor)
- [x] Add coffee hero section and branding (logo, titles, seed imagery)

## Phase 4: My Suggestions (Value Add)
- [x] Add vendor rating/review system concept (documented in README roadmap)
- [x] Add sample request flow concept (documented in README roadmap)
- [x] Add B2B wholesale pricing documentation (documented in README roadmap)
- [x] Add Arabic localization for coffee profile (ar.json)

## Phase 5: Documentation & Commit
- [x] Update README completely
- [ ] Commit all changes on the feature branch
- [ ] Push to GitHub
