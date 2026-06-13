/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-award.
 * Base block: cards
 * Source URL: https://kaufmanrossin.com/
 * Source selector: .sbc-hero-homepage-kr__credentials
 * Generated: 2026-06-13
 *
 * Text-only award/recognition strip. A "RECOGNIZED FOR EXCELLENCE" label
 * (.sbc-hero-homepage-kr__credentials__label) followed by several short award
 * statements (.sbc-hero-homepage-kr__credentials__item /
 * .sbc-hero-homepage-kr__credentials__text). No images — each award becomes a
 * single text-only card (one row, one cell). The label is preserved as a
 * leading card so no source content is lost.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Recognition label (e.g. "RECOGNIZED FOR EXCELLENCE")
  // Validated selector: span.sbc-hero-homepage-kr__credentials__label
  const label = element.querySelector('.sbc-hero-homepage-kr__credentials__label, [class*="credentials__label"]');
  if (label) {
    const labelText = label.textContent.trim();
    if (labelText) {
      const strong = document.createElement('strong');
      strong.textContent = labelText;
      cells.push([strong]);
    }
  }

  // Individual award statements
  // Validated selector: .sbc-hero-homepage-kr__credentials__item .sbc-hero-homepage-kr__credentials__text
  let awards = Array.from(element.querySelectorAll(
    '.sbc-hero-homepage-kr__credentials__item .sbc-hero-homepage-kr__credentials__text, [class*="credentials__text"]'
  ));
  // Fallback: if text spans are not found, use the item containers directly
  if (awards.length === 0) {
    awards = Array.from(element.querySelectorAll(
      '.sbc-hero-homepage-kr__credentials__item, [class*="credentials__item"]'
    ));
  }

  awards.forEach((award) => {
    const text = award.textContent.trim();
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      cells.push([p]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-award', cells });
  element.replaceWith(block);
}
