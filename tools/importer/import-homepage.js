/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroOverlayParser from './parsers/hero-overlay.js';
import cardsAwardParser from './parsers/cards-award.js';
import cardsPromoParser from './parsers/cards-promo.js';
import accordionIndustriesParser from './parsers/accordion-industries.js';
import videoFeatureParser from './parsers/video-feature.js';
import columnsFeatureParser from './parsers/columns-feature.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/kaufmanrossin-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-overlay': heroOverlayParser,
  'cards-award': cardsAwardParser,
  'cards-promo': cardsPromoParser,
  'accordion-industries': accordionIndustriesParser,
  'video-feature': videoFeatureParser,
  'columns-feature': columnsFeatureParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Kaufman Rossin homepage - landing page with hero, service/section highlights, navigation header and footer',
  urls: [
    'https://kaufmanrossin.com/',
  ],
  blocks: [
    {
      name: 'cards-award',
      instances: ['.sbc-hero-homepage-kr__credentials'],
    },
    {
      name: 'hero-overlay',
      instances: ['.sbc-hero-homepage-kr'],
    },
    {
      name: 'cards-promo',
      instances: ['.sbc-kr-family-cards', '.sbc-locations-grid-kr'],
    },
    {
      name: 'accordion-industries',
      instances: ['.sbc-industries-accordion-kr'],
    },
    {
      name: 'video-feature',
      instances: ['.sbc-video-banner-kr'],
    },
    {
      name: 'columns-feature',
      instances: ['section.sbc-half-image-copy-kr'],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * cards-award is listed before hero-overlay because its selector
 * (.sbc-hero-homepage-kr__credentials) is a descendant of the hero selector;
 * parsing/replacing the credentials strip first prevents it from being
 * consumed inside the hero block.
 * @param {Document} document
 * @param {Object} template
 * @returns {Array} block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using its registered parser
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup (removes header, footer, iframes, etc.)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized output path. Map the site root ("/") to "/index" and
    // guarantee a leading slash so the importer never falls back to a
    // relative path (which triggers process.cwd() in the headless bundle).
    const pathname = new URL(params.originalURL).pathname
      .replace(/\.html$/, '')
      .replace(/\/$/, '');
    let path = WebImporter.FileUtils.sanitizePath(pathname || '/index');
    if (!path.startsWith('/')) path = `/${path}`;

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
