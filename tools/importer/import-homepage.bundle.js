/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-overlay.js
  function parse(element, { document }) {
    const hero = element.querySelector('.sbc-hero-homepage-kr__hero, [class*="__hero"]') || element;
    const content = hero.querySelector('.sbc-hero-homepage-kr__content, [class*="__content"]') || hero;
    const heading = content.querySelector('h1, h2, [class*="__title"], [class*="title"]');
    let bgImage = hero.querySelector(":scope > img") || hero.querySelector('img[class*="background"], img[class*="hero"]');
    if (!bgImage) {
      const bgCandidates = [
        hero,
        hero.querySelector('[class*="__overlay"]')
      ].filter(Boolean);
      let bgUrl = "";
      for (const node of bgCandidates) {
        const inline = node.style && node.style.backgroundImage;
        const computed = node.ownerDocument.defaultView && node.ownerDocument.defaultView.getComputedStyle(node).backgroundImage || "";
        const styleValue = (inline && inline !== "none" ? inline : "") || computed;
        const match = styleValue && styleValue.match(/url\((['"]?)(.*?)\1\)/i);
        if (match && match[2] && !match[2].startsWith("data:")) {
          bgUrl = match[2];
          break;
        }
      }
      if (bgUrl) {
        bgImage = document.createElement("img");
        bgImage.setAttribute("src", bgUrl);
      }
    }
    if (bgImage && !bgImage.getAttribute("alt")) {
      bgImage.setAttribute("alt", heading ? heading.textContent.trim() : "Hero background");
    }
    const description = content.querySelector('p, [class*="__description"], [class*="description"]');
    const ctaLinks = Array.from(content.querySelectorAll(
      '.sbc-hero-homepage-kr__buttons a, [class*="__buttons"] a, a.btn-kr'
    ));
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentWrapper = document.createElement("div");
    if (heading) contentWrapper.append(heading);
    if (description) contentWrapper.append(description);
    ctaLinks.forEach((cta) => contentWrapper.append(cta));
    cells.push([contentWrapper]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-overlay", cells });
    if (hero && hero !== element) {
      hero.replaceWith(block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-award.js
  function parse2(element, { document }) {
    const cells = [];
    const label = element.querySelector('.sbc-hero-homepage-kr__credentials__label, [class*="credentials__label"]');
    if (label) {
      const labelText = label.textContent.trim();
      if (labelText) {
        const strong = document.createElement("strong");
        strong.textContent = labelText;
        cells.push([strong]);
      }
    }
    let awards = Array.from(element.querySelectorAll(
      '.sbc-hero-homepage-kr__credentials__item .sbc-hero-homepage-kr__credentials__text, [class*="credentials__text"]'
    ));
    if (awards.length === 0) {
      awards = Array.from(element.querySelectorAll(
        '.sbc-hero-homepage-kr__credentials__item, [class*="credentials__item"]'
      ));
    }
    awards.forEach((award) => {
      const text = award.textContent.trim();
      if (text) {
        const p = document.createElement("p");
        p.textContent = text;
        cells.push([p]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-award", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse3(element, { document }) {
    let cards = Array.from(
      element.querySelectorAll(
        'a[class*="family-cards__card"], a[class*="locations-grid"], a[class*="__card"], a[class*="__item__link"]'
      )
    );
    if (cards.length === 0) {
      cards = Array.from(
        element.querySelectorAll('[class*="__card"], [class*="__item"], [class*="-card"]')
      ).filter((c) => c.tagName !== "A");
    }
    const resolveImage = (card) => {
      const imgs = Array.from(card.querySelectorAll("img"));
      const realImg = imgs.find((img) => !img.classList.contains("sr-only")) || imgs[0];
      if (realImg) return realImg;
      const bgEl = card.querySelector('[class*="__image"], [class*="-image"], [style*="background-image"]');
      if (bgEl) {
        const bg = bgEl.getAttribute("style") || "";
        const match = bg.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
        if (match && match[2]) {
          const img = document.createElement("img");
          img.setAttribute("src", match[2]);
          img.setAttribute("alt", "");
          return img;
        }
      }
      return null;
    };
    const cells = [];
    cards.forEach((card) => {
      const image = resolveImage(card);
      const labelEl = card.querySelector(
        '[class*="__label"], [class*="__item__name"], [class*="-label"], [class*="__name"], h2, h3, h4'
      );
      const description = card.querySelector('[class*="__description"], [class*="-description"], p');
      const ctaTextEl = card.querySelector(
        '[class*="__cta__text"], [class*="cta__text"], [class*="__cta"]'
      );
      const href = card.tagName === "A" ? card.getAttribute("href") : card.querySelector("a") ? card.querySelector("a").getAttribute("href") : null;
      const textCell = [];
      const hasDistinctCta = !!(description || ctaTextEl);
      if (labelEl && hasDistinctCta) {
        const heading = document.createElement("h3");
        heading.textContent = labelEl.textContent.trim();
        textCell.push(heading);
      }
      if (description) textCell.push(description);
      if (href) {
        const cta = document.createElement("a");
        cta.setAttribute("href", href);
        let text = "";
        if (ctaTextEl) text = ctaTextEl.textContent.trim();
        else if (labelEl) text = labelEl.textContent.trim();
        cta.textContent = text || href;
        textCell.push(cta);
      }
      if (image || textCell.length > 0) {
        cells.push([image ? [image] : "", textCell.length > 0 ? textCell : ""]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-industries.js
  function parse4(element, { document }) {
    const cells = [];
    const items = element.querySelectorAll(".kr-accordion-item");
    items.forEach((item) => {
      const titleEl = item.querySelector(".kr-accordion-title, .kr-accordion-header");
      const label = titleEl ? (titleEl.textContent || "").trim() : "";
      const body = item.querySelector(".kr-accordion-body");
      const bodyCell = [];
      if (body) {
        const paragraphs = Array.from(body.querySelectorAll("p")).filter(
          (p) => !p.closest(".kr-panel-mobile")
        );
        paragraphs.forEach((p) => bodyCell.push(p));
        const img = body.querySelector(".kr-panel-mobile img, img");
        if (img) bodyCell.push(img);
        const cta = body.querySelector(".kr-panel-mobile a, a.btn-kr, a");
        if (cta) bodyCell.push(cta);
      }
      if (label || bodyCell.length) {
        cells.push([label, bodyCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "accordion-industries",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-feature.js
  function parse5(element, { document }) {
    const heading = element.querySelector(
      ".sbc-video-banner-kr__title, h1, h2, h3"
    );
    const description = element.querySelector(
      ".sbc-video-banner-kr__description, .sbc-video-banner-kr__card p, p"
    );
    const background = element.querySelector(".sbc-video-banner-kr__background");
    let posterImg = element.querySelector(".sbc-video-banner-kr__background > img") || Array.from(element.querySelectorAll("img")).find(
      (img) => !img.closest(".sbc-video-banner-kr__play-wrapper, .sbc-video-banner-kr__play-btn")
    );
    if (!posterImg && background) {
      const inlineStyle = background.getAttribute("style") || "";
      const styleMatch = inlineStyle.match(/background-image\s*:\s*url\((['"]?)(.*?)\1\)/i);
      const bgUrl = styleMatch && styleMatch[2] || background.getAttribute("data-bg") || background.getAttribute("data-src") || background.getAttribute("data-background-image");
      if (bgUrl) {
        posterImg = document.createElement("img");
        posterImg.src = bgUrl;
      }
    }
    const videoLink = element.querySelector(
      'a[href$=".mp4"], a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"], a[data-video], a[href*="video"]'
    );
    const cells = [];
    if (posterImg) {
      cells.push([posterImg]);
    }
    if (videoLink) {
      cells.push([videoLink]);
    }
    if (heading || description) {
      const contentWrapper = document.createElement("div");
      if (heading) contentWrapper.append(heading);
      if (description) contentWrapper.append(description);
      cells.push([contentWrapper]);
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "video-feature",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse6(element, { document }) {
    var _a;
    const isBlockRoot = element.classList.contains("sbc-half-image-copy-kr") && !!element.querySelector(".sbc-half-image-copy-kr__wrapper, .sbc-half-image-copy-kr__content");
    if (!isBlockRoot) {
      return;
    }
    const imageWrap = element.querySelector(".sbc-half-image-copy-kr__image");
    let imageEl = null;
    const srcImg = imageWrap ? imageWrap.querySelector("img[src]") : element.querySelector(".sbc-half-image-copy-kr__image-col img[src]");
    if (srcImg) {
      imageEl = srcImg;
      imageEl.classList.remove("sr-only");
    } else if (imageWrap) {
      const style = imageWrap.getAttribute("style") || "";
      const match = style.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
      if (match && match[2]) {
        imageEl = document.createElement("img");
        imageEl.src = match[2];
        const alt = (imageWrap.getAttribute("aria-label") || ((_a = element.querySelector(".sbc-half-image-copy-kr__title")) == null ? void 0 : _a.textContent) || "").trim();
        if (alt) imageEl.alt = alt;
      }
    }
    const content = element.querySelector(".sbc-half-image-copy-kr__content") || element.querySelector(".sbc-half-image-copy-kr__content-col") || element;
    const eyebrow = content.querySelector('.sbc-half-image-copy-kr__eyebrow, [class*="eyebrow"]');
    const heading = content.querySelector('.sbc-half-image-copy-kr__title, h1, h2, h3, [class*="title"]');
    const textBlock = content.querySelector('.sbc-half-image-copy-kr__text, [class*="text"]');
    const paragraphs = textBlock ? Array.from(textBlock.querySelectorAll(":scope > p, :scope > ul, :scope > ol")) : Array.from(content.querySelectorAll(":scope > p"));
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
    const imageRight = element.classList.contains("sbc-half-image-copy-kr--image-right");
    const imageCell = imageEl ? [imageEl] : [];
    let row;
    if (imageRight) {
      row = [textCell, imageCell];
    } else {
      row = [imageCell, textCell];
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/kaufmanrossin-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#CybotCookiebotDialog",
        // Cookiebot consent dialog (verified)
        '[id*="CybotCookiebot"]',
        // Cookiebot leftover containers/links (verified)
        '[class*="CybotCookiebot"]',
        // Cookiebot styled wrappers (verified)
        ".CybotEdge",
        // Cookiebot root edge wrapper (verified)
        ".sbc-kaufman-footer__contact-mkto-form",
        // slide-out Contact Us Marketo modal (verified)
        ".sbc-kaufman-footer__contact-mkto-form__show-button-wrapper"
        // modal trigger (verified)
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        // semantic header element (verified)
        ".sbc-kaufman-header",
        // header/nav section (verified)
        ".sbc-kaufman-footer",
        // footer section (verified)
        "iframe",
        // embeds, not authorable (verified: 11 present)
        "noscript"
        // safe to drop
      ]);
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-overlay": parse,
    "cards-award": parse2,
    "cards-promo": parse3,
    "accordion-industries": parse4,
    "video-feature": parse5,
    "columns-feature": parse6
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Kaufman Rossin homepage - landing page with hero, service/section highlights, navigation header and footer",
    urls: [
      "https://kaufmanrossin.com/"
    ],
    blocks: [
      {
        name: "cards-award",
        instances: [".sbc-hero-homepage-kr__credentials"]
      },
      {
        name: "hero-overlay",
        instances: [".sbc-hero-homepage-kr"]
      },
      {
        name: "cards-promo",
        instances: [".sbc-kr-family-cards", ".sbc-locations-grid-kr"]
      },
      {
        name: "accordion-industries",
        instances: [".sbc-industries-accordion-kr"]
      },
      {
        name: "video-feature",
        instances: [".sbc-video-banner-kr"]
      },
      {
        name: "columns-feature",
        instances: ["section.sbc-half-image-copy-kr"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const pathname = new URL(params.originalURL).pathname.replace(/\.html$/, "").replace(/\/$/, "");
      let path = WebImporter.FileUtils.sanitizePath(pathname || "/index");
      if (!path.startsWith("/")) path = `/${path}`;
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
