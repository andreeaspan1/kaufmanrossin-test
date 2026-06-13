/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: video-feature
 * Base block: video
 * Source selector: .sbc-video-banner-kr
 * Generated: 2026-06-13
 *
 * Source structure (validated against source.html):
 *   .sbc-video-banner-kr
 *     .sbc-video-banner-kr__content
 *       .sbc-video-banner-kr__card
 *         h2.sbc-video-banner-kr__title        -> heading "Our Independence in Action"
 *         p.sbc-video-banner-kr__description    -> descriptive subtext
 *     .sbc-video-banner-kr__background
 *       img                                     -> poster / full-bleed background image
 *       .sbc-video-banner-kr__play-wrapper
 *         button.sbc-video-banner-kr__play-btn  -> play trigger (inline SVG icon, no video URL)
 *
 * Target table (video band): block name row, then poster image, then optional
 * video link, then the overlay heading + description.
 */
export default function parse(element, { document }) {
  // Heading (h2 in source; allow h1/h3 fallbacks for variation)
  const heading = element.querySelector(
    '.sbc-video-banner-kr__title, h1, h2, h3',
  );

  // Descriptive subtext
  const description = element.querySelector(
    '.sbc-video-banner-kr__description, .sbc-video-banner-kr__card p, p',
  );

  // Poster / full-bleed background image. The background container holds the
  // poster <img> directly; the play button's icon lives in a separate nested
  // wrapper. Prefer the direct-child image of the background to avoid the icon.
  const background = element.querySelector('.sbc-video-banner-kr__background');
  let posterImg = element.querySelector('.sbc-video-banner-kr__background > img')
    || Array.from(element.querySelectorAll('img')).find(
      (img) => !img.closest('.sbc-video-banner-kr__play-wrapper, .sbc-video-banner-kr__play-btn'),
    );

  // Fallback: the live page may render the poster as a CSS background-image
  // (inline style or data attribute) rather than an <img>. Synthesize an <img>
  // element so the poster is preserved in the imported block.
  if (!posterImg && background) {
    const inlineStyle = background.getAttribute('style') || '';
    const styleMatch = inlineStyle.match(/background-image\s*:\s*url\((['"]?)(.*?)\1\)/i);
    const bgUrl = (styleMatch && styleMatch[2])
      || background.getAttribute('data-bg')
      || background.getAttribute('data-src')
      || background.getAttribute('data-background-image');
    if (bgUrl) {
      posterImg = document.createElement('img');
      posterImg.src = bgUrl;
    }
  }

  // Video URL / play trigger. The source uses a <button> with an inline SVG icon
  // and no href, so there may be no link to extract. Capture an explicit video
  // link if present (anchor pointing at a video file or known video host).
  const videoLink = element.querySelector(
    'a[href$=".mp4"], a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"], a[data-video], a[href*="video"]',
  );

  const cells = [];

  // Row: poster / background image (single column)
  if (posterImg) {
    cells.push([posterImg]);
  }

  // Row: video source link (only when an actual video URL exists in the source)
  if (videoLink) {
    cells.push([videoLink]);
  }

  // Row: overlay content (heading + description) wrapped in a single container
  // so it forms one column rather than splitting across columns.
  if (heading || description) {
    const contentWrapper = document.createElement('div');
    if (heading) contentWrapper.append(heading);
    if (description) contentWrapper.append(description);
    cells.push([contentWrapper]);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'video-feature',
    cells,
  });
  element.replaceWith(block);
}
