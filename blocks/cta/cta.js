/*
 * CTA — centered closing call-to-action: heading, supporting line, and a green
 * button with a left-to-right white wipe on hover. Matches the source
 * "Your next breakthrough starts here" banner.
 */

export default function decorate(block) {
  const link = block.querySelector('a');
  if (link) link.classList.add('cta-btn');
}
