# BookLeaf Publishing Design System

Reference: <https://www.bookleafpub.in/>. This document captures the public homepage theme and recurring UI patterns for implementation.

## Design direction

BookLeaf uses an editorial, publishing-led marketing aesthetic: spacious white sections, oversized light-weight headlines, dark text, and a confident royal-blue CTA color. Photography, book covers, illustrations, proof points, and partner logos carry most of the visual richness. UI surfaces themselves stay flat, square, and restrained.

## Foundations

### Color tokens

```css
:root {
  --color-canvas: #ffffff;
  --color-ink: #2f2e2e;
  --color-text-muted: #605e5e;
  --color-border: #cccccc;
  --color-disabled: #a0a09f;

  --color-primary: #3b58b8;
  --color-primary-strong: #273b7b;
  --color-accent: #f16876;
  --color-accent-strong: #d12a3c;
}
```

Use white as the dominant background. Use `--color-ink` for heading and body copy, reserving blue for actions, links, and directional emphasis. Coral is a promotional accent, not the default action color.

### Typography

The live Wix theme defines Avenir LT as the core typeface and DIN Next for navigation/microcopy. Use the listed fallbacks when the licensed families are not available.

```css
:root {
  --font-display:
    "Avenir LT W01 85 Heavy", Avenir, Helvetica, Arial, sans-serif;
  --font-body: "Avenir LT W01 35 Light", Avenir, Helvetica, Arial, sans-serif;
  --font-nav: "DIN Next W01 Light", "DIN Next", Arial, sans-serif;
}
```

| Role               |    Size | Weight | Line height |
| ------------------ | ------: | ------ | ----------: |
| Display            |    90px | heavy  |         1.4 |
| H1                 |    56px | light  |         1.4 |
| H2                 |    50px | light  |         1.4 |
| H3                 |    33px | heavy  |         1.4 |
| H4                 |    20px | light  |         1.4 |
| Body               |    17px | light  |         1.4 |
| Small              |    14px | light  |         1.4 |
| Micro / navigation | 12-16px | light  |         1.4 |

For responsive work, scale display and headline text down substantially rather than preserving desktop sizes.

### Shape and effects

- Default corner radius: `0px`.
- Buttons, inputs, and cards are predominantly flat and rectangular.
- Borders are subtle, generally neutral gray or blue in interactive states.
- Avoid heavy shadows; elevation is not a core part of the visual language.

## Components

### Header and navigation

- White full-width header with logo at the left and dense horizontal navigation.
- Navigation uses `--font-nav`, around 16px.
- Default links use ink; hover and selected states shift to muted gray.
- On narrow screens, collapse the navigation into a menu while keeping a primary publishing CTA visible when space permits.

### Primary button

```css
.button-primary {
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 0;
  color: var(--color-canvas);
  font-family: var(--font-body);
}

.button-primary:hover {
  background: var(--color-canvas);
  color: var(--color-primary);
}
```

Use concise, active labels such as "Publish My Book", "Get Started", and "Contact Us". Keep button labels on one line where possible.

### Secondary / inverse button

Use white fill, blue border, and blue label text. On hover, invert to a solid blue fill with white text.

### Forms

- Labels sit above controls.
- Inputs have white fills and square corners.
- Use a thin neutral border by default.
- On hover and focus, use a blue border; do not use dramatic glows.
- Keep multi-field lead forms simple: name, email, country code, phone, and a single CTA.

### Pricing card

- Center the package name and price.
- Present benefits as a simple vertical list.
- Use repeated CTA styling across every plan.
- Let plan differences be made through copy, hierarchy, and featured treatment rather than excessive surface decoration.

### Metric block

- Pair a large numeric value (for example, `150K+`) with a short supporting label.
- Use an adjacent icon or illustration where appropriate.
- Arrange as a row on desktop and a compact grid or stack on mobile.

### Testimonial and media blocks

- Prioritize the author's image/video thumbnail and short proof-oriented copy.
- Use carousels sparingly; expose controls clearly and support swipe on mobile.
- Partner/publication logos should be monochrome or visually normalized so the section remains calm.

## Page composition

The homepage uses full-width horizontal bands in this approximate order:

1. Header and publishing hero
2. Reviews/social proof and "as seen on" credibility
3. Benefits/value propositions
4. Writing challenge promotion
5. Book launches and bestseller evidence
6. Lead-capture contact form
7. Community and distribution metrics
8. Media logos
9. Publishing packages
10. Distribution partners
11. Author testimonials
12. Money-back guarantee
13. Mobile/self-service promotion
14. Contact CTA and information-dense footer

For new pages, preserve this rhythm: lead with a single strong promise, follow it with proof, explain benefits, then present the conversion action.

## Imagery and content

- Use authentic book covers, author photography, launch imagery, and editorial illustrations.
- Favor crisp assets with generous whitespace over decorative gradients.
- Combine short, direct headings with practical supporting copy.
- Trust signals should be factual and specific: counts, distribution reach, press appearances, royalties, guarantees, and reviews.

## Accessibility and interaction

- Maintain at least WCAG AA contrast for text and interactive controls; blue on white is suitable for large text and button borders, while body text should remain ink.
- Preserve visible keyboard focus; use a clear 2px blue focus outline.
- Do not rely on color alone for selected navigation or pricing-plan emphasis.
- Provide meaningful alternative text for book covers, author photos, press marks, and promotional illustrations.
- Ensure carousels can be paused or manually controlled and remain keyboard-operable.

## Implementation notes

- The reference site is built with Wix; treat these tokens as a design reference, not a dependency on Wix markup or classes.
- Keep component APIs semantic and reusable (`Button`, `TextField`, `PricingCard`, `Metric`, `TestimonialCard`, `Section`).
- Use a constrained content container within full-bleed bands. Avoid placing every section inside a card.
- Prefer mobile-first stacking of complex desktop rows, especially pricing, metrics, and logo grids.
