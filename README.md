# Velvet / Afsana - Recovered Frontend Project

This folder contains the complete, locally runnable frontend reconstruction for the wedding invitation demo (**Amina & Zayan — Nikkah Invitation Demo**), recovered directly from public browser-delivered assets.

## Project Structure

```
velvet-recovered/
├── index.html                    # Main HTML document with local relative links
├── favicon.svg                   # Vector site favicon
├── css/                          # Clean root-level stylesheets
│   ├── fonts.css                 # Local @font-face declarations
│   ├── styles.css                # Base structural styles and layout
│   ├── theme.css                 # Theme tokens, ornate borders, and animations
│   └── all.min.css               # Local FontAwesome 6.7.2 stylesheet
├── js/                           # Separate, modular client-side scripts
│   ├── config.js                 # Complete invitation content, dates & media config
│   ├── app.js                    # Core application logic, data binding, and audio/video controls
│   ├── scratch.js                # Canvas scratch-off interaction for Save the Date cards
│   ├── scratch-celebration.js    # Particle burst and confetti celebration on scratch completion
│   ├── fireworks.js              # Canvas fireworks celebration engines
│   ├── glimmer.js                # Drifting gold and pearl glimmer atmospheric veil
│   └── preview-ui.js             # Modal and CTA interaction handlers
├── images/                       # High-resolution WebP/PNG/JPG graphics
│   ├── gold-az-monogram-custom.png # Ornate couple monogram
│   ├── royal-seam-divider.png    # Ornamental section divider seams
│   ├── divider.png               # Lace accent divider
│   ├── ribbon-poster-v2.jpg      # Video opening fallback poster
│   ├── mosque-couple-fast-final.webp # Courtyard hero art
│   ├── hands.webp                # Embroidered hands artwork
│   ├── formal-ivory-floral.webp  # Formal section backdrop
│   ├── pearl-floral-event.webp   # Event card textured backdrop
│   ├── closing-evening-garden.webp # Blessings section background
│   ├── mosque-courtyard.webp     # Mosque courtyard background
│   ├── ivory-silk.webp           # Ivory silk texture
│   ├── pearl-border-left.webp    # Decorative pearl border left
│   ├── pearl-border-right.webp   # Decorative pearl border right
│   └── wedding-demo.jpg          # Social share card
├── fonts/                        # Complete typography suite (TTF/WOFF)
│   ├── amiri-regular.ttf         # Arabic script primary
│   ├── amiri-bold.ttf            # Arabic script bold
│   ├── cormorant-sc-regular.ttf  # Small-caps serif
│   ├── cormorant-sc-medium.ttf   # Small-caps serif medium
│   ├── cormorant-sc-semibold.ttf # Small-caps serif semibold
│   ├── marcellus-regular.ttf     # Elegant display serif
│   ├── monsieur-la-doulaise-regular.ttf # Flowing calligraphy script
│   ├── bodoni-moda-2.ttf         # Bodoni Moda italic
│   ├── bodoni-moda-3.ttf         # Bodoni Moda regular
│   └── parisienne-regular.ttf    # Parisienne script for couple & event names
├── webfonts/                     # FontAwesome 6.7.2 icon glyphs
│   ├── fa-solid-900.woff2 / .ttf
│   ├── fa-regular-400.woff2 / .ttf
│   ├── fa-brands-400.woff2 / .ttf
│   └── fa-v4compatibility.woff2 / .ttf
├── icons/                        # Icons and monograms
│   ├── favicon.svg
│   └── gold-az-monogram-custom.png
├── media/                        # Full audio/video & calendar media
│   ├── ribbon-doves-intro-v3-fast.mp4 # Opening ribbon ceremony video (2.1 MB)
│   ├── audio-5.mp3               # Background soundtrack (4.8 MB)
│   └── nikkah.ics                # Add to Calendar file
└── assets/                       # Mirror of assets directory for backward-compatibility
    ├── css/
    ├── js/
    ├── images/
    ├── fonts/
    └── webfonts/
```

## How to Run Locally

Because the project includes an HTML5 `<video>`, background `<audio>`, and custom local `@font-face` resources, modern browsers enforce CORS restrictions when opening directly via the `file://` protocol. 

To run with full audio, video, and font support:

### Option 1: Python HTTP Server (Built-in)
Run the following in this directory:
```bash
python -m http.server 8080
```
Then open your browser at:
[http://localhost:8080](http://localhost:8080)

### Option 2: Node.js (npx serve or live-server)
```bash
npx serve .
```

### Option 3: VS Code / Cursor Live Server Extension
Right-click `index.html` and select **"Open with Live Server"**.

## Reconstructed Features & Integrations
- **Opening Curtain & Gate**: Interactive seal uncovers the ceremony video with smooth transition and skip option.
- **Background Music Player**: Floating audio toggle with muted start state and playback state persistence.
- **Interactive Scratch Card**: Save-the-date scratch-off canvas with gold particle celebration.
- **Dual Canvas Animations**: Particle glimmer veil (`glimmer.js`) and fireworks displays (`fireworks.js`).
- **Dynamic Content Injection**: All couple names, dates, Quranic verses, and event schedules bind seamlessly via `config.js`.
- **100% Offline Capability**: All external dependencies (Google Fonts, FontAwesome CDN) have been localized.
