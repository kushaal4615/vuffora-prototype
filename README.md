# Vuffora · clickable prototype

On-demand dog-walking marketplace for India (Mohali, Chandigarh, Delhi NCR). Three platforms in one viewer:
**Dog Owner App** (20 screens), **Dog Walker App** (13 screens), **Super Admin** web portal (12 screens),
plus the **Full Feature List** of the specification.

```
REFERENCE BOARD
Ref 1:  Uber      → the trip is a full-bleed map with a sheet lapping it, not a card below a map ·
                    a 4-digit PIN shown huge on the rider's screen and typed on the driver's ·
                    one primary action docked at the bottom of every trip step
Ref 2:  Duolingo  → chunky rounded display type doing the branding with no illustration needed ·
                    flat saturated colour blocks as whole sections, not tinted cards ·
                    pill buttons with a hard colour glow and a press that visibly sinks
Ref 3:  Strava    → the activity is three oversized numerals over a route line ·
                    a vertical timeline of moments with photos hanging off a spine ·
                    borderless list rows separated by rhythm and weight, each with a micro-chart

ART DIRECTION
Direction:   Sunshine & Royal (custom, derived from the client's own logo and reference image)
Style lens:  apple-design (fluid, physical motion; sheets over maps; glass docks) applied manually
Personality: warm, trustworthy, playful
Palette:     accent #2348D6 (royal blue) · support #FFC605 (brand yellow, sampled from the app icon) ·
             base #FFFCF1 · on-accent #FFFFFF · on-yellow #14172B
Type:        Fredoka / Plus Jakarta Sans (+ DM Mono for meta) · scale: 11 / 13 / 15 / 17 / 22 / 34 / 56 / 80
Surface:     white surfaces on a yellow-warmed base, flat colour blocks, glass docks
Radius:      28 / 20 / 14 / 999  (container / card / control / chip)
Theme:       light, no toggle
Motion:      springy-overshoot
Signature:   photo-led walker cards with a ringed avatar lapping the photo, a sheet lapping a full-bleed map
Device:      the sun (a yellow disc bleeding off an edge, from the logo's blob) and the swoosh
             (the hand-drawn underline from the logo, under names and prices)
Composition: full-bleed hero · horizontal rail · map surface · stacked sheet layer · oversized numeral ·
             timeline/spine · split panel · list-dense editorial · chart-led · overlapping/offset
             (per-screen counts are in the delivery report)
Rejected:    Marigold row (yellow on cream with brown support, Bricolage Grotesque): closest instinct for
             "pets + marketplace", but the client asked for royal blue and the logo's Fredoka-like wordmark
Skills used: full-output-enforcement · design-taste-frontend · emil-design-eng (loaded);
             ui-ux-pro-max, design-system, impeccable, apple-design, dataviz applied manually
```

## Demo logins (every field is pre-filled; no typing needed)

| Platform | Login |
| --- | --- |
| Dog Owner App | +91 98765 43210 · ananya.sharma@demo-vuffora.app / Demo@2026 · SMS code 482619 |
| Dog Walker App | +91 98140 55210 · arjun.mehta@demo-vuffora.app / Demo@2026 |
| Super Admin | ops@demo-vuffora.app / Demo@2026 |

Walk handover codes: Check-In OTP **4826**, Check-Out OTP **7391**.

## One walk, three apps

The session store (`src/lib/store.ts`) keeps one walk in memory, so in a single browser tab:
paying in the Owner App puts the job on the walker's phone; the OTP the walker enters starts the owner's
live walk; the walker's activity logs appear on the owner's timeline; chat messages cross over; the
admin's vetting and KYC decisions change the status banners in both apps; the admin's rate card changes
the owner's prices. A page reload resets the demo.

## Assumed values to confirm

The specification names these but gives no figures. The prototype uses demo values, all in
`src/data/core.ts` (`DEFAULT_PRICING`) and editable on the admin Pricing page:
base walk fee ₹199 / ₹279 / ₹349 (30 / 45 / 60 min) · aggressive-dog surcharge ₹120 · Walk Now fee ₹30 ·
GST 18% · platform commission 20% (spec range 15 to 25%) · Walk Pass 20 walks at 10% off (the spec's own example) ·
OTP validity 10 minutes · GPS ping every 4 seconds (spec: 3 to 5).

## Journey logging

`src/lib/tracker.js` is wired but **not connected**: `ENDPOINT` is a placeholder, so nothing is sent.
To log visits to a Google Sheet, deploy an Apps Script web app and paste its `/exec` URL there.

## Run

```bash
npm install
npm run dev        # http://localhost:5322
npm run build      # tsc --noEmit && vite build → dist/
vercel --prod
```

Photography: Unsplash (IDs in `src/data/media.ts`, each checked live and by eye). Brand art in
`public/brand` is the client's own logo.
