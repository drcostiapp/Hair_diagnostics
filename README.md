# Dr. Costi House of Beauty

A luxury dermatology and wellness website with an immersive, Netflix-style design.

## Features

- **Sticky Navigation** - Desktop nav with dropdown menus + mobile floating bottom nav
- **Hero Section** - Autoplay video with rotating taglines
- **Netflix-style Rows** - Horizontally scrolling teaser cards with video previews
- **Sections**: The Experience, Our Houses, Signature Treatments, Shop, Testimonials, Global Reach, Academy
- **Luxury Footer** - Sitemap, newsletter signup, social links, contact info

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - UI component primitives

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Brand Colors

- Cream: `#F8F4ED` - Primary background
- Forest: `#18483D` - Primary text
- Teal: `#2E5E56` - CTA buttons
- Gold: `#C6A77B` - Secondary accent
- Sand: `#D8C2A0` - Borders and subtle accents

## Project Structure

```
├── app/
│   ├── globals.css      # Global styles + Tailwind
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Main wireframe component
├── components/
│   └── ui/
│       └── button.tsx   # Button component
├── lib/
│   └── utils.ts         # Utility functions (cn)
├── public/
│   ├── images/          # Poster images
│   └── teasers/         # Video teasers
└── ...config files
```

## Adding Media Assets

Place video teasers in `/public/teasers/` and poster images in `/public/images/`. The component references these paths for the Netflix-style cards.