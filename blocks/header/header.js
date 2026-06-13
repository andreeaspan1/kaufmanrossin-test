import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Collapses all open top-level nav groups.
 * @param {Element} navList The top-level nav <ul>
 */
function closeAllGroups(navList) {
  navList.querySelectorAll(':scope > li[aria-expanded="true"]').forEach((li) => {
    li.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Opens or closes the mobile drawer.
 * @param {Element} nav The nav element
 * @param {boolean} [force] Force a specific state
 */
function toggleDrawer(nav, force = null) {
  const expanded = force !== null ? force : nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
  const button = nav.querySelector('.nav-hamburger button');
  if (button) button.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment (dual-fetch: local mirror first, then DA/EDS path)
  const navMeta = getMetadata('nav');
  const candidates = navMeta
    ? [new URL(navMeta, window.location).pathname]
    : ['/content/nav', '/nav'];
  let fragment = null;
  for (let i = 0; i < candidates.length && !fragment; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    fragment = await loadFragment(candidates[i]);
  }
  if (!fragment) return;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Map the three fragment sections: utility links, brand/logo, main menu.
  const [utility, brand, sections] = nav.children;
  if (utility) utility.classList.add('nav-utility');
  if (brand) brand.classList.add('nav-brand');
  if (sections) sections.classList.add('nav-sections');

  // Decorate the main menu groups (top-level <li> that contain a nested <ul>).
  const navList = sections ? sections.querySelector(':scope > ul') : null;
  if (navList) {
    navList.querySelectorAll(':scope > li').forEach((li) => {
      const submenu = li.querySelector(':scope > ul');
      if (submenu) {
        li.classList.add('nav-drop');
        li.setAttribute('aria-expanded', 'false');
        const label = li.querySelector(':scope > a');
        // Toggle button so the group can open without following the link.
        const toggle = document.createElement('button');
        toggle.className = 'nav-drop-toggle';
        toggle.setAttribute('aria-label', `Toggle ${label ? label.textContent.trim() : 'submenu'}`);
        toggle.setAttribute('type', 'button');
        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          const open = li.getAttribute('aria-expanded') === 'true';
          if (open) {
            li.setAttribute('aria-expanded', 'false');
          } else {
            if (isDesktop.matches) closeAllGroups(navList);
            li.setAttribute('aria-expanded', 'true');
          }
        });
        li.insertBefore(toggle, submenu);
      }
    });
  }

  // Hamburger toggle for the mobile drawer.
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open menu">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleDrawer(nav));

  // Place the hamburger inside the brand bar so logo + toggle share a row.
  if (brand) brand.append(hamburger);
  else nav.prepend(hamburger);

  nav.setAttribute('aria-expanded', 'false');

  // Close the drawer / collapse groups when crossing to desktop.
  const handleViewport = () => {
    if (isDesktop.matches) {
      toggleDrawer(nav, false);
      document.body.style.overflowY = '';
    }
    if (navList) closeAllGroups(navList);
  };
  isDesktop.addEventListener('change', handleViewport);

  // Close open desktop dropdowns when clicking outside the nav.
  document.addEventListener('click', (e) => {
    if (isDesktop.matches && navList && !nav.contains(e.target)) closeAllGroups(navList);
  });

  // Escape closes drawer + dropdowns.
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      if (navList) closeAllGroups(navList);
      if (!isDesktop.matches) toggleDrawer(nav, false);
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
