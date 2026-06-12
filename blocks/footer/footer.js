import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Builds the top band: logo, link columns (heading + list), and the social row.
 * Reads content from the first section of the fragment — no hardcoded copy.
 * @param {Element} section The first fragment section
 */
function decorateTopBand(section) {
  section.classList.add('footer-top');

  // The logo is the first paragraph that contains an image-link.
  const logoPara = [...section.querySelectorAll('p')].find((p) => p.querySelector('a img'));
  if (logoPara) logoPara.classList.add('footer-logo');

  // The social row is the list whose links contain images.
  const socialList = [...section.querySelectorAll('ul')].find((ul) => ul.querySelector('a img'));
  if (socialList) socialList.classList.add('footer-social');

  // Build link columns from each heading + the following block (list or paragraphs).
  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  section.querySelectorAll('h3').forEach((heading) => {
    const column = document.createElement('div');
    column.className = 'footer-column';
    column.append(heading);
    let next = heading.nextElementSibling;
    while (next && next.tagName !== 'H3' && next !== socialList) {
      const following = next.nextElementSibling;
      column.append(next);
      next = following;
    }
    columns.append(column);
  });

  // Order: logo, columns, social row.
  if (logoPara) section.append(logoPara);
  section.append(columns);
  if (socialList) section.append(socialList);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const candidates = footerMeta
    ? [new URL(footerMeta, window.location).pathname]
    : ['/content/footer', '/footer'];
  let fragment = null;
  for (let i = 0; i < candidates.length && !fragment; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    fragment = await loadFragment(candidates[i]);
  }
  if (!fragment) return;

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const sections = footer.children;
  if (sections[0]) decorateTopBand(sections[0]);
  if (sections[1]) sections[1].classList.add('footer-legal');

  block.append(footer);
}
