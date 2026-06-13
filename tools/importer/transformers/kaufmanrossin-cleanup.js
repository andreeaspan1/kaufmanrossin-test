/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Kaufman Rossin site-wide cleanup.
 *
 * Removes non-authorable site chrome and overlays so the import contains only
 * page-level authorable content. All selectors below were verified against
 * migration-work/cleaned.html (the scraped homepage DOM).
 *
 * Verified in captured DOM:
 *   - #CybotCookiebotDialog ............... Cookiebot consent dialog
 *   - .CybotCookiebot* / .CybotEdge ....... Cookiebot leftover containers
 *   - .sbc-kaufman-header (a <section>) ... site header/nav (migrated separately)
 *   - <header> ............................ semantic header element
 *   - .sbc-kaufman-footer ................. site footer (already migrated separately)
 *   - .sbc-kaufman-footer__contact-mkto-form .......... slide-out Contact Us Marketo modal
 *   - .sbc-kaufman-footer__contact-mkto-form__show-button-wrapper ... modal trigger button
 *   - <iframe> ............................ 11 embeds present; not authorable
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / modals that block or pollute block parsing.
    WebImporter.DOMUtils.remove(element, [
      '#CybotCookiebotDialog', // Cookiebot consent dialog (verified)
      '[id*="CybotCookiebot"]', // Cookiebot leftover containers/links (verified)
      '[class*="CybotCookiebot"]', // Cookiebot styled wrappers (verified)
      '.CybotEdge', // Cookiebot root edge wrapper (verified)
      '.sbc-kaufman-footer__contact-mkto-form', // slide-out Contact Us Marketo modal (verified)
      '.sbc-kaufman-footer__contact-mkto-form__show-button-wrapper', // modal trigger (verified)
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome. Header and footer are migrated separately.
    WebImporter.DOMUtils.remove(element, [
      'header', // semantic header element (verified)
      '.sbc-kaufman-header', // header/nav section (verified)
      '.sbc-kaufman-footer', // footer section (verified)
      'iframe', // embeds, not authorable (verified: 11 present)
      'noscript', // safe to drop
    ]);
  }
}
