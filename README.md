# TidBit

TidBit is a concept for an e-ink display that snaps onto the back of an iPhone with MagSafe. It shows the few things you chose to see (your next meeting, the weather, what's playing) and stays quiet the rest of the time.

This repository is the product website. It's a static site with no build step, published to GitHub Pages from `main`.

**Live site:** https://timonim.github.io/Tidbit/

## What's on the page

- **The turn.** As you scroll, a 3D iPhone 18 Pro turns from its calm back (TidBit) to its noisy front (notifications) and back again.
- **Why e-ink.** A side-by-side ledger of a phone screen against an e-paper panel.
- **A day with TidBit.** Five moments in a day. The TidBit stays put while the steps scroll past, redrawing with an e-ink flash at each one.
- **Specs.** A stylized dimensional drawing of TidBit that draws itself in.
- **How it works.** Snap, Pair, Glance, sketched one step at a time.
- **Integrations** and the developer waitlist.

All motion turns off for visitors who prefer reduced motion.

## Files

| File | What it is |
| --- | --- |
| `index.html`, `home.css`, `home.js` | The home page |
| `tidbit.html`, `styles.css`, `script.js` | The live e-ink screen and iPhone mockup, embedded in the home page. Add `?color=black`, `silver`, `blue` or `burgundy` to pick the phone's finish. |
| `images/` | 1-bit dithered album covers for the e-ink screen |
| `favicon.svg`, `og-image.jpg` | Icon and social sharing image |
| `tools/drawing.py` | Generates the dimensional drawing in `index.html` |

## Running it locally

From the repository folder, start any static server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

To change the dimensional drawing, edit `tools/drawing.py` and run it. It prints the SVG; paste the output between the `drawing:start` and `drawing:end` comments in `index.html`.

```bash
python3 tools/drawing.py > drawing.svg
```

## Still to do

The waitlist form shows a confirmation but doesn't store emails yet. It needs a form service such as Formspree or Buttondown.

## Contact

- GitHub: [timonim](https://github.com/timonim)
- Instagram: [@portnoytim](https://www.instagram.com/portnoytim)
- LinkedIn: [Tim Portnoy](https://www.linkedin.com/in/tim-portnoy)

© 2025 TidBit. All rights reserved to Tim Portnoy.
