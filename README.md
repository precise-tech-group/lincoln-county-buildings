# Lincoln County Buildings

A premium, modern website redesign for **Lincoln County Buildings**, an authorized dealer of
Old Hickory Buildings & Sheds in Alamo, Nevada. The site showcases portable storage sheds,
lofted barns, garages, animal shelters, greenhouses, cabanas, and specialty buildings — with
engineer-certified construction, free local delivery, and a rent-to-own purchase option.

This is a full creative rebuild of the client's existing site, preserving all real business
information, brand identity, and logo (services, sizes, pricing snapshot, warranty terms,
contact details) while replacing the dated template design with a premium editorial
experience: an asymmetrical split hero, an interactive Size Explorer and Building Explorer,
and cinematic scroll animation throughout. The color system is sampled directly from the
client's real Old Hickory Buildings & Sheds dealer logo (deep teal-navy `#145c7c` + gold
`#ecbc54` + warm cream), paired with Fraunces (display) and Inter (body) type.

## Technology stack

Pure static front end — no framework, no build step, no backend:

- **HTML5** — one semantic, SEO-structured page per route
- **CSS3** — a hand-built design system (custom properties, responsive grid/flex layouts, no CSS framework)
- **Vanilla JavaScript** — header/nav behavior, form handling, scroll-triggered animations
- **[GSAP](https://gsap.com/) + ScrollTrigger** — scroll-linked reveals, split-text hero animation, parallax, pinned horizontal scroll
- **[Lenis](https://lenis.darkroom.engineering/)** — smooth inertial scrolling
- **[Three.js](https://threejs.org/)** — a procedural wireframe gable-barn-frame scene in the homepage hero, with mouse-responsive parallax
- All third-party libraries are loaded from CDN (jsDelivr) — nothing to install for the front end itself

## Project structure

```
/
├── index.html                          Homepage
├── inventory.html                      In-stock buildings (snapshot) + Buy/Rent-to-Own
├── lofted-barns-utility-sheds.html     Building category
├── shed-addon-packages.html            Building category
├── specialty-buildings-sheds.html      Building category
├── space-for-your-animals.html         Building category
├── shed-upgrades-options-addons.html   Building category
├── rent-to-own.html                    Pay-over-time program
├── warranty-details-claims.html        Warranty & claims process
├── about.html                          About the dealership & Old Hickory
├── contact.html                        Contact info, map, quote form, full FAQ
├── shed-solutions-blog.html            Blog index
├── blog-*.html                         Four blog articles
├── privacy-policy.html
├── assets/
│   ├── css/
│   │   ├── style.css                   Design tokens + all components
│   │   └── responsive.css              Breakpoint overrides
│   ├── js/
│   │   ├── main.js                     Header, mobile nav, dropdowns, forms
│   │   └── animations.js               Lenis, GSAP/ScrollTrigger, Three.js hero scene
│   └── images/                         Licensed stock photography
└── README.md
```

Every page shares the same header, mobile navigation, and footer markup, and the same two
stylesheets — there is no page-specific CSS to keep in sync.

## Local preview

No build step is required. Serve the folder with any static file server, for example:

```bash
npx serve .
# or
npx http-server .
```

Then open the printed local URL (e.g. `http://localhost:3000`).

Opening `index.html` directly via `file://` also mostly works, but a local server is
recommended so relative asset paths and the smooth-scroll behavior match production.

## Deployment (Nginx / VPS)

This is a static site — deploy by copying the repository contents to your web root and
serving it with Nginx. A minimal server block:

```nginx
server {
    listen 80;
    server_name lincolncountybuildings.com www.lincolncountybuildings.com;
    root /var/www/lincolncountybuildings;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Put TLS in front of it (Certbot/Let's Encrypt or your platform's managed certs) and point
DNS at the server. No environment variables, database, or runtime are required.

## Notes

- The **Inventory** page lists a point-in-time snapshot of real units/pricing from the client's
  live site. Since this is a static site with no backend, that list won't auto-update — replace
  the cards in `inventory.html` when stock changes, or wire it to a real data source later.
- The **3D Builder** and **Buy/Rent Now** buttons link out to the manufacturer's existing hosted
  tools (`orders.oldhickorybuildings.com`, `myorder.oldhickorybuildings.com`) — these are real,
  working third-party systems already used by the client, not placeholders.
- Contact and quote forms are built and validated client-side but are **not wired to a backend**.
  Hook `assets/js/main.js`'s `data-form` submit handler up to a real endpoint (email service,
  serverless function, etc.) before relying on them to deliver leads.
