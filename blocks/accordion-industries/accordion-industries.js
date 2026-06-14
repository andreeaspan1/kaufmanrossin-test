/*
 * Accordion (Featured Industries) — single-open behavior matching the source:
 * exactly one item is open at a time; clicking a closed item opens it and
 * closes the others; clicking the already-open item keeps it open.
 */

export default function decorate(block) {
  // Section title shown above the accordion (matches the source layout).
  const title = document.createElement('h2');
  title.className = 'accordion-industries-title';
  title.id = 'featured-industries';
  title.textContent = 'Featured Industries';
  block.parentElement.insertBefore(title, block);

  const items = [];

  [...block.children].forEach((row, i) => {
    const label = row.children[0];
    const body = row.children[1];

    const item = document.createElement('div');
    item.className = 'accordion-industries-item';

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'accordion-industries-item-label';
    header.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
    header.append(...label.childNodes);

    body.className = 'accordion-industries-item-body';

    // Split the body into a text column (description + CTA) and an image
    // column so the image sits to the right of the text (matches the source).
    const textCol = document.createElement('div');
    textCol.className = 'accordion-industries-item-text';
    const imageCol = document.createElement('div');
    imageCol.className = 'accordion-industries-item-image';

    [...body.children].forEach((child) => {
      if (child.querySelector('picture, img')) imageCol.append(child);
      else textCol.append(child);
    });
    body.textContent = '';
    body.append(textCol, imageCol);

    item.append(header, body);
    if (i === 0) item.classList.add('is-active');
    row.replaceWith(item);
    items.push({ item, header });
  });

  items.forEach(({ item, header }) => {
    header.addEventListener('click', () => {
      if (item.classList.contains('is-active')) return; // active item stays open
      items.forEach((other) => {
        const open = other.item === item;
        other.item.classList.toggle('is-active', open);
        other.header.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  });
}
