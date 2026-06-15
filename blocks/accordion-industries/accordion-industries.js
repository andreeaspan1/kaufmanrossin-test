/*
 * Accordion (Featured Industries) — matches the source:
 * - Left column: accordion list of industries (title + collapsible description/CTA).
 * - Right panel: a FIXED image area holding every item's image stacked in the
 *   same place; only the active item's image is shown. Clicking an item opens
 *   its text and swaps the visible image without the image moving.
 * - Single-open: exactly one item open; the active item stays open on re-click.
 */

export default function decorate(block) {
  // Section title shown above the accordion.
  const title = document.createElement('h2');
  title.className = 'accordion-industries-title';
  title.id = 'featured-industries';
  title.textContent = 'Featured Industries';
  block.parentElement.insertBefore(title, block);

  // Build the two columns: list (left) + shared image panel (right).
  const layout = document.createElement('div');
  layout.className = 'accordion-industries-layout';
  const list = document.createElement('div');
  list.className = 'accordion-industries-list';
  const panel = document.createElement('div');
  panel.className = 'accordion-industries-panel';

  const items = [];

  [...block.children].forEach((row, i) => {
    const label = row.children[0];
    const body = row.children[1];

    // Pull the image out of the body into the shared right panel.
    const imageHolder = document.createElement('div');
    imageHolder.className = 'accordion-industries-image';
    const imgEl = body.querySelector('picture, img');
    if (imgEl) {
      const imgWrap = imgEl.closest('p') || imgEl;
      imageHolder.append(imgEl.closest('picture') || imgEl);
      if (imgWrap.parentElement && imgWrap.tagName === 'P' && !imgWrap.textContent.trim()) {
        imgWrap.remove();
      }
    }
    if (i === 0) imageHolder.classList.add('is-active');
    panel.append(imageHolder);

    // Accordion item (left): header + collapsible text body.
    const item = document.createElement('div');
    item.className = 'accordion-industries-item';

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'accordion-industries-item-label';
    header.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
    header.append(...label.childNodes);

    body.className = 'accordion-industries-item-body';

    // Style the standalone CTA link as a navy green-wipe button (source btn-kr).
    const cta = [...body.querySelectorAll('p > a')].find(
      (a) => a.parentElement.textContent.trim() === a.textContent.trim(),
    );
    if (cta) cta.classList.add('accordion-industries-btn');

    item.append(header, body);
    if (i === 0) item.classList.add('is-active');
    list.append(item);
    items.push({ item, header, imageHolder });
  });

  layout.append(list, panel);
  block.textContent = '';
  block.append(layout);

  items.forEach(({ item, header }) => {
    header.addEventListener('click', () => {
      if (item.classList.contains('is-active')) return; // active item stays open
      items.forEach((other) => {
        const open = other.item === item;
        other.item.classList.toggle('is-active', open);
        other.header.setAttribute('aria-expanded', open ? 'true' : 'false');
        other.imageHolder.classList.toggle('is-active', open);
      });
    });
  });
}
