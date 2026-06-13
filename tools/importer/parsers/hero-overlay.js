/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-overlay.
 * Base block: hero
 * Source URL: https://kaufmanrossin.com/
 * Source selector: .sbc-hero-homepage-kr
 * Generated: 2026-06-13
 *
 * Full-width homepage banner with a photographic background image, a dark
 * overlay, an H1 headline ("Independence is a choice."), an intro paragraph,
 * and two CTA links ("Explore Our Services", "Meet Our Team").
 *
 * Structure follows the base `hero` convention:
 *   Row 1: background image (optional — only added when present)
 *   Row 2: content cell containing heading + description + CTA buttons
 *
 * NOTE: The source `.sbc-hero-homepage-kr` element also contains a
 * `.sbc-hero-homepage-kr__credentials` recognition strip. That content is a
 * separate variant (cards-award) and is intentionally NOT included here —
 * extraction is scoped to the `.sbc-hero-homepage-kr__hero` content block.
 */
export default function parse(element, { document }) {
  // Scope to the hero content block so the credentials strip (a separate
  // variant) is excluded. Fall back to the element itself if the inner hero
  // wrapper is absent.
  const hero = element.querySelector('.sbc-hero-homepage-kr__hero, [class*="__hero"]') || element;
  const content = hero.querySelector('.sbc-hero-homepage-kr__content, [class*="__content"]') || hero;

  // Headline. Validated: h1.sbc-hero-homepage-kr__title
  const heading = content.querySelector('h1, h2, [class*="__title"], [class*="title"]');

  // Background image.
  // On the live page the hero background is delivered via CSS
  // `background-image: url(...)` on `.sbc-hero-homepage-kr__hero` (NOT a real
  // <img>). Resolve the image in priority order:
  //   1. A real <img> directly inside the hero (if the markup ever provides one)
  //   2. The computed/inline CSS background-image URL on the hero/overlay
  // Whatever is found is materialized as a real <img> so the hero block imports
  // an actual image rather than losing the background.
  let bgImage = hero.querySelector(':scope > img')
    || hero.querySelector('img[class*="background"], img[class*="hero"]');

  if (!bgImage) {
    // Pull the URL out of the CSS background-image of the hero (or overlay).
    const bgCandidates = [
      hero,
      hero.querySelector('[class*="__overlay"]'),
    ].filter(Boolean);

    let bgUrl = '';
    for (const node of bgCandidates) {
      const inline = node.style && node.style.backgroundImage;
      const computed = (node.ownerDocument.defaultView
        && node.ownerDocument.defaultView.getComputedStyle(node).backgroundImage) || '';
      const styleValue = (inline && inline !== 'none' ? inline : '') || computed;
      const match = styleValue && styleValue.match(/url\((['"]?)(.*?)\1\)/i);
      if (match && match[2] && !match[2].startsWith('data:')) {
        bgUrl = match[2];
        break;
      }
    }

    if (bgUrl) {
      bgImage = document.createElement('img');
      bgImage.setAttribute('src', bgUrl);
    }
  }

  // Ensure the image carries alt text so it survives markdown conversion
  // (markdown images require alt: ![alt](src)).
  if (bgImage && !bgImage.getAttribute('alt')) {
    bgImage.setAttribute('alt', heading ? heading.textContent.trim() : 'Hero background');
  }

  // Intro paragraph. Validated: p.sbc-hero-homepage-kr__description
  const description = content.querySelector('p, [class*="__description"], [class*="description"]');

  // CTA links. Validated: a.btn-kr inside .sbc-hero-homepage-kr__buttons
  const ctaLinks = Array.from(content.querySelectorAll(
    '.sbc-hero-homepage-kr__buttons a, [class*="__buttons"] a, a.btn-kr'
  ));

  const cells = [];

  // Row 1: background image (only when present). Single cell.
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: heading + description + CTA buttons stacked in ONE cell.
  // Wrap all content nodes in a single container so they occupy a single
  // cell/column rather than being spread across multiple columns.
  const contentWrapper = document.createElement('div');
  if (heading) contentWrapper.append(heading);
  if (description) contentWrapper.append(description);
  ctaLinks.forEach((cta) => contentWrapper.append(cta));
  cells.push([contentWrapper]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-overlay', cells });

  // Replace only the inner hero content block, NOT the outer
  // `.sbc-hero-homepage-kr` element. The outer element also contains a sibling
  // `.sbc-hero-homepage-kr__credentials` recognition strip handled by the
  // separate cards-award parser; replacing the whole outer element here would
  // delete that strip before it can be parsed. Falling back to the element
  // itself only when the inner hero wrapper was not found.
  if (hero && hero !== element) {
    hero.replaceWith(block);
  } else {
    element.replaceWith(block);
  }
}
