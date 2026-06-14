import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-promo-card-image';
      } else {
        div.className = 'cards-promo-card-body';
        // Wrap the description + CTA (everything after the heading) so the
        // whole block can slide up as one unit on hover (matches the source).
        const heading = div.querySelector('h3');
        const reveal = document.createElement('div');
        reveal.className = 'cards-promo-card-reveal';
        const rest = [...div.children].filter((c) => c !== heading);
        rest.forEach((c) => reveal.append(c));
        div.append(reveal);
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);

  // The firm-family instance (Wealth Solutions / Fund Administration) carries a
  // centered "Get to Know Your Firm Family" heading above the cards in the
  // source. Inject it for that instance only.
  const headings = [...ul.querySelectorAll('h3')].map((h) => h.textContent.trim());
  if (headings.includes('Wealth Solutions') && headings.includes('Fund Administration')) {
    block.classList.add('cards-promo-family');
    const title = document.createElement('h2');
    title.className = 'cards-promo-title';
    title.textContent = 'Get to Know Your Firm Family';
    block.parentElement.insertBefore(title, block);
  }

  // The locations instance has no headings — each card is an image plus a
  // place-name link. Render it as a compact single row with the name shown as
  // a visible caption under the image, beneath a centered "Locations" heading.
  const cards = [...ul.children];
  const isLocations = headings.length === 0
    && cards.length > 0
    && cards.every((li) => li.querySelector('picture') && li.querySelector('a'));
  if (isLocations) {
    block.classList.add('cards-promo-locations');
    const title = document.createElement('h2');
    title.className = 'cards-promo-title';
    title.textContent = 'Locations';
    block.parentElement.insertBefore(title, block);
  }
}
