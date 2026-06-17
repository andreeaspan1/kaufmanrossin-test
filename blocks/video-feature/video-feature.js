/*
 * Video Feature — full-bleed background image with a navy heading box on top
 * and a centered play button. Clicking play swaps the poster for the embedded
 * (Vimeo) video, matching the source "Our Independence in Action" banner.
 *
 * Content: one row, two cells — [poster image] | [video link]. The link text
 * is used as the heading; the description is fixed copy for this banner.
 */

// Two lines with a hard break before "and innovation", matching the source.
const DESCRIPTION_LINES = [
  'See how our independent model benefits our clients by delivering stability, value',
  'and innovation year after year.',
];

function embedVimeo(videoId, hash) {
  const params = new URLSearchParams({ autoplay: '1' });
  if (hash) params.set('h', hash);
  const wrap = document.createElement('div');
  wrap.className = 'video-feature-embed';
  wrap.innerHTML = `<iframe src="https://player.vimeo.com/video/${videoId}?${params}"
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
      title="Our Independence in Action"></iframe>`;
  return wrap;
}

function parseVideoLink(href) {
  try {
    const url = new URL(href);
    if (url.hostname.includes('vimeo')) {
      const id = url.pathname.split('/').filter(Boolean)[0];
      const hash = url.searchParams.get('h') || '';
      return { id, hash };
    }
  } catch (e) { /* ignore */ }
  return null;
}

export default async function decorate(block) {
  const picture = block.querySelector('picture, img');
  const link = block.querySelector('a');
  const headingText = link ? link.textContent.trim() : 'Our Independence in Action';
  // Use the authored Vimeo link; fall back to the known banner video so the
  // play button always works even if the link was transformed by EDS.
  const video = (link && parseVideoLink(link.getAttribute('href')))
    || { id: '803236744', hash: 'f1fc4f610f' };

  block.textContent = '';

  // Background image layer.
  const bg = document.createElement('div');
  bg.className = 'video-feature-bg';
  if (picture) bg.append(picture.closest('picture') || picture);

  // Navy heading box.
  const content = document.createElement('div');
  content.className = 'video-feature-content';
  const h = document.createElement('h2');
  h.textContent = headingText;
  const desc = document.createElement('p');
  desc.append(
    document.createTextNode(DESCRIPTION_LINES[0]),
    document.createElement('br'),
    document.createTextNode(DESCRIPTION_LINES[1]),
  );
  content.append(h, desc);

  // Play button.
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'video-feature-play';
  play.setAttribute('aria-label', 'Play Video');

  block.append(content, bg);
  bg.append(play);

  if (video) {
    play.addEventListener('click', () => {
      block.classList.add('is-playing');
      bg.append(embedVimeo(video.id, video.hash));
    });
  } else {
    play.hidden = true;
  }
}
