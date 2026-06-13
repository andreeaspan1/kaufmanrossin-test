/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-industries.
 * Base block: accordion.
 * Source: https://kaufmanrossin.com/ (.sbc-industries-accordion-kr)
 * Generated: 2026-06-13
 *
 * Source structure: a "Featured Industries" accordion. Each item
 * (.kr-accordion-item) has a title (.kr-accordion-title) and a body
 * (.kr-accordion-body) containing a description paragraph, plus a mobile
 * panel (.kr-panel-mobile) holding the supporting image and the CTA link.
 * The right column (.kr-panel) merely duplicates the image + CTA already
 * present inside each accordion item, so we extract solely from the items
 * to avoid duplicated content.
 *
 * Target accordion table: one row per item -> [ label | body ], where the
 * body cell combines the description, image, and CTA link.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each accordion entry. Validated against source: div.kr-accordion-item
  const items = element.querySelectorAll('.kr-accordion-item');

  items.forEach((item) => {
    // Label: the industry name. Source uses span.kr-accordion-title inside
    // the header button. Fall back to the header button text if missing.
    const titleEl = item.querySelector('.kr-accordion-title, .kr-accordion-header');
    const label = titleEl ? (titleEl.textContent || '').trim() : '';

    // Body content: description paragraph(s) + supporting image + CTA link.
    const body = item.querySelector('.kr-accordion-body');
    const bodyCell = [];

    if (body) {
      // Description paragraph(s) live directly in the body, outside the
      // mobile panel. Restrict to those not inside .kr-panel-mobile.
      const paragraphs = Array.from(body.querySelectorAll('p')).filter(
        (p) => !p.closest('.kr-panel-mobile'),
      );
      paragraphs.forEach((p) => bodyCell.push(p));

      // Supporting image (inside the mobile panel).
      const img = body.querySelector('.kr-panel-mobile img, img');
      if (img) bodyCell.push(img);

      // CTA link (e.g. "Learn More" / "Discover More").
      const cta = body.querySelector('.kr-panel-mobile a, a.btn-kr, a');
      if (cta) bodyCell.push(cta);
    }

    // Only add a row when we have a label or some body content.
    if (label || bodyCell.length) {
      cells.push([label, bodyCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'accordion-industries',
    cells,
  });

  element.replaceWith(block);
}
