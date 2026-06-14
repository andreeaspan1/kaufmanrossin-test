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
}
