# Elevate Smoke, Vape & CBD: website draft

A one-page website concept for Elevate Smoke, Vape & CBD, 1651 Powder Springs Rd SW, Marietta, GA 30064, in the same plaza as Bolivar Coffee.

**Status: draft for review.** Preview: https://evanmcdowell31.github.io/elevate-site/ (GitHub Pages, from `docs/` on `main`). Every page view shows a draft banner, and `noindex` keeps it out of search engines. It is not the shop's official site, which is elevatesmoke.shop.

| Phone | Desktop |
| --- | --- |
| ![Phone, first view](review/home-phone.png) | ![Desktop, first view](review/home-desktop.png) |

More in `review/`: the age check, the visit section, and both full pages.

## What's on the page

- A 21+ age check before the site opens. A yes is remembered on that device.
- "Open now" or "Closed" in the header, worked out from the shop's hours in Marietta time. Today's hours and today's special are marked.
- What's in the case: glass, vapes, hookah, papers, CBD, accessories. The vape card carries the FDA nicotine warning.
- Sample weekly specials, on accessories only.
- Directions (Google Maps and Apple Maps), tap to call, and a sketch of the plaza beside Bolivar Coffee.
- On phones, a Directions and Call bar appears once the top buttons scroll away.

## The idea

Elevate means elevation. The shop's address sits 1,036 ft above sea level (USGS), so the brand mark is the map symbol for a summit, ▲. The top of the page is a dusk ridgeline whose altimeter climbs to 1,036 ft once you pass the age check. The colours come from alpenglow, the light on high ground at dusk: night blue, ridge slate, haze, alpenglow rose, summit gold and snow.

The type is Big Shoulders Display for signs and headlines, Schibsted Grotesk for text and Martian Mono for readouts. All three are served from `docs/fonts/` under the SIL Open Font License (license files alongside), so the page loads nothing from other servers.

## Preview and screenshots

```sh
python3 -m http.server -d docs 8000   # open http://localhost:8000
node tools/shoot.mjs                  # re-renders review/*.png and docs/og.png
```

Add `?nogate` to the address to skip the age check, and `?still` to stop the motion. The screenshots use both. `tools/shoot.mjs` drives Playwright's cached headless Chromium shell, with no window.

## Before it could go live

- [ ] The shop's logo, photos of the counter and the glass, and their real specials.
- [ ] Confirm the hours and phone, and which side of Bolivar Coffee the storefront is on. The plaza sketch is a guess.
- [ ] Decide what to say about hemp THC and kratom. The draft leaves them out because federal rules are changing: synthetic cannabinoids such as THC-O lose hemp status on 12 November 2026, and most hemp-THC products on 11 December 2026.
- [ ] Remove the draft banner and `noindex`, add schema.org `Store` data, and point elevatesmoke.shop at the site.

## Sources

- Address, phone and hours: public listings (MapQuest, Yahoo Local, Roadtrippers), read 2026-11-08.
- Elevation: the USGS Elevation Point Query Service, 1,035.7 ft, at the US Census geocoder's point for the address (33.908° N, 84.601° W), read 2026-11-08.
- Hemp dates: CNN (3 November 2026) and the Cannabis Law Blog, on the delay signed 2 September 2026.
- Fonts: Google Fonts, SIL Open Font License 1.1.
