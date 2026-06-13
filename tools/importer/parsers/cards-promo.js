/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo. Base: cards.
 * Source: https://kaufmanrossin.com/
 * Selectors: .sbc-kr-family-cards, .sbc-locations-grid-kr (shared promo-card structure)
 * Generated: 2026-06-13
 *
 * Two promo-card shapes share this parser:
 *  - Family/announcement cards (.sbc-kr-family-cards__card): label bar, an <img>,
 *    a description paragraph, and a CTA span. The card <a> carries the CTA href.
 *  - Location cards (.sbc-locations-grid-kr__item__link): a CSS background-image
 *    div and a city-name span only (no description, no separate label). The card
 *    <a> carries the href.
 *
 * Standard cards layout: one 2-column row per card (image | text).
 */
export default function parse(element, { document }) {
  // Match the linked card containers for either variant. Selectors are mutually
  // exclusive (each card class belongs to exactly one variant).
  let cards = Array.from(
    element.querySelectorAll(
      'a[class*="family-cards__card"], a[class*="locations-grid"], a[class*="__card"], a[class*="__item__link"]',
    ),
  );

  // Fallback: non-anchor card containers if no linked cards were found.
  if (cards.length === 0) {
    cards = Array.from(
      element.querySelectorAll('[class*="__card"], [class*="__item"], [class*="-card"]'),
    ).filter((c) => c.tagName !== 'A');
  }

  // Resolve an image for a card, handling both <img> and CSS background-image.
  const resolveImage = (card) => {
    // 1) Prefer a real <img>, skipping the screen-reader-only duplicate.
    const imgs = Array.from(card.querySelectorAll('img'));
    const realImg = imgs.find((img) => !img.classList.contains('sr-only')) || imgs[0];
    if (realImg) return realImg;

    // 2) Otherwise look for a background-image on an image wrapper div.
    const bgEl = card.querySelector('[class*="__image"], [class*="-image"], [style*="background-image"]');
    if (bgEl) {
      const bg = bgEl.getAttribute('style') || '';
      const match = bg.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
      if (match && match[2]) {
        const img = document.createElement('img');
        img.setAttribute('src', match[2]);
        img.setAttribute('alt', '');
        return img;
      }
    }
    return null;
  };

  const cells = [];

  cards.forEach((card) => {
    const image = resolveImage(card);

    // Heading/label: the overlay label bar (family cards) or the city name (locations).
    const labelEl = card.querySelector(
      '[class*="__label"], [class*="__item__name"], [class*="-label"], [class*="__name"], h2, h3, h4',
    );
    const description = card.querySelector('[class*="__description"], [class*="-description"], p');

    // CTA text and href. Family cards expose explicit CTA text; locations reuse the name.
    const ctaTextEl = card.querySelector(
      '[class*="__cta__text"], [class*="cta__text"], [class*="__cta"]',
    );
    const href = card.tagName === 'A'
      ? card.getAttribute('href')
      : (card.querySelector('a') ? card.querySelector('a').getAttribute('href') : null);

    const textCell = [];

    // Promote the label to a heading only when it is distinct from the CTA — i.e.
    // when there is a description or explicit CTA text. Location cards (name only,
    // no description, no separate CTA text) become a single link and skip the heading
    // to avoid duplicating the city name as both heading and link.
    const hasDistinctCta = !!(description || ctaTextEl);

    if (labelEl && hasDistinctCta) {
      const heading = document.createElement('h3');
      heading.textContent = labelEl.textContent.trim();
      textCell.push(heading);
    }
    if (description) textCell.push(description);

    if (href) {
      const cta = document.createElement('a');
      cta.setAttribute('href', href);
      let text = '';
      if (ctaTextEl) text = ctaTextEl.textContent.trim();
      else if (labelEl) text = labelEl.textContent.trim();
      cta.textContent = text || href;
      textCell.push(cta);
    }

    if (image || textCell.length > 0) {
      cells.push([image ? [image] : '', textCell.length > 0 ? textCell : '']);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
