import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const sections = [...document.querySelectorAll('main section')];
    const revealTargets = [];

    sections.forEach((section) => {
      const headings = section.querySelectorAll('h2');
      headings.forEach((heading) => {
        heading.classList.add('reveal-heading');
        revealTargets.push(heading);
      });

      const items = section.querySelectorAll('article, details, form');
      items.forEach((item, index) => {
        item.classList.add('reveal-item', index % 2 === 0 ? 'reveal-from-left' : 'reveal-from-right');
        item.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 110}ms`);
        revealTargets.push(item);
      });

      const media = section.querySelectorAll('img');
      media.forEach((image, index) => {
        image.classList.add(index % 2 === 0 ? 'reveal-media-left' : 'reveal-media-right');
        revealTargets.push(image);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.18) {
            entry.target.classList.add('is-visible');
          } else if (entry.intersectionRatio === 0) {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { rootMargin: '0px 0px -16% 0px', threshold: [0, 0.18] },
    );

    revealTargets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

export default ScrollReveal;
