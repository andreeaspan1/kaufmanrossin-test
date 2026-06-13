/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature.
 * Base block: columns
 * Source URL: https://kaufmanrossin.com/
 * Source selector: [class*="sbc-half-image-copy-kr"]
 * Generated: 2026-06-13
 *
 * Structure: two-part feature, one image cell + one text cell in a single row.
 * - Source DOM order is always image-col then content-col, but visual order is
 *   controlled by the modifier class --image-left / --image-right. We honor the
 *   visual order so the columns block renders the image on the correct side.
 * - The image is delivered as a CSS background-image on .sbc-half-image-copy-kr__image,
 *   with a visually-hidden <img class="sr-only"> carrying the real src + alt text.
 *   We promote that <img> (or synthesize one from the background-image url) so the
 *   columns block has a real image.
 * - The text cell contains eyebrow + heading + paragraph(s) + one or more CTAs.
 */
export default function parse(element, { document }) {
  // The instance selector [class*="sbc-half-image-copy-kr"] is a substring match,
  // so it also matches nested descendants (e.g. __image, __content-col, __image-col)
  // whose class names contain the same prefix. Only the top-level block element
  // carries the bare `sbc-half-image-copy-kr` class token AND wraps a __wrapper.
  // Skip anything that is a nested part to avoid emitting empty blocks.
  const isBlockRoot = element.classList.contains('sbc-half-image-copy-kr')
    && !!element.querySelector('.sbc-half-image-copy-kr__wrapper, .sbc-half-image-copy-kr__content');
  if (!isBlockRoot) {
    return;
  }

  // --- Image cell ---------------------------------------------------------
  const imageWrap = element.querySelector('.sbc-half-image-copy-kr__image');
  let imageEl = null;

  // Prefer the existing <img> (often class="sr-only" with the real src + alt).
  const srcImg = imageWrap
    ? imageWrap.querySelector('img[src]')
    : element.querySelector('.sbc-half-image-copy-kr__image-col img[src]');
  if (srcImg) {
    imageEl = srcImg;
    // The site hides the real image via .sr-only and paints a background instead;
    // drop that class so the image renders in the imported block.
    imageEl.classList.remove('sr-only');
  } else if (imageWrap) {
    // Fall back to synthesizing an <img> from the inline background-image url.
    const style = imageWrap.getAttribute('style') || '';
    const match = style.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
    if (match && match[2]) {
      imageEl = document.createElement('img');
      imageEl.src = match[2];
      const alt = (imageWrap.getAttribute('aria-label') || element.querySelector('.sbc-half-image-copy-kr__title')?.textContent || '').trim();
      if (alt) imageEl.alt = alt;
    }
  }

  // --- Text cell ----------------------------------------------------------
  const content = element.querySelector('.sbc-half-image-copy-kr__content')
    || element.querySelector('.sbc-half-image-copy-kr__content-col')
    || element;

  const eyebrow = content.querySelector('.sbc-half-image-copy-kr__eyebrow, [class*="eyebrow"]');
  const heading = content.querySelector('.sbc-half-image-copy-kr__title, h1, h2, h3, [class*="title"]');
  const textBlock = content.querySelector('.sbc-half-image-copy-kr__text, [class*="text"]');
  const paragraphs = textBlock
    ? Array.from(textBlock.querySelectorAll(':scope > p, :scope > ul, :scope > ol'))
    : Array.from(content.querySelectorAll(':scope > p'));
  const ctas = Array.from(element.querySelectorAll('.sbc-half-image-copy-kr__ctas a[href], [class*="ctas"] a[href]'));

  const textCell = [];
  if (eyebrow) textCell.push(eyebrow);
  if (heading) textCell.push(heading);
  if (paragraphs.length) {
    textCell.push(...paragraphs);
  } else if (textBlock) {
    textCell.push(textBlock);
  }
  textCell.push(...ctas);

  // --- Order cells by visual layout --------------------------------------
  // --image-right => text on the left, image on the right.
  // --image-left (default) => image on the left, text on the right.
  const imageRight = element.classList.contains('sbc-half-image-copy-kr--image-right');

  const imageCell = imageEl ? [imageEl] : [];
  let row;
  if (imageRight) {
    row = [textCell, imageCell];
  } else {
    row = [imageCell, textCell];
  }

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
