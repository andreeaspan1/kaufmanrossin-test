export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-feature-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-feature-img-col');
        }
      }
    });
  });

  // Style standalone CTA links as buttons with the source's green-wipe effect.
  // First button = navy (primary), any subsequent buttons = white (secondary).
  const ctas = [...block.querySelectorAll('p > a')].filter(
    (a) => a.parentElement.textContent.trim() === a.textContent.trim(),
  );
  ctas.forEach((a, i) => {
    a.classList.add('columns-feature-btn');
    a.classList.add(i === 0 ? 'columns-feature-btn-navy' : 'columns-feature-btn-white');
  });
}
