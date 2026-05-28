import type { Screen } from './types';

export const placeholderScreen: Screen = {
  mount(host) {
    const root = document.createElement('div');
    root.classList.add('screen', 'screen-placeholder');
    root.innerHTML = `
      <p class="placeholder-title">screen 5 — coming soon</p>
      <p class="placeholder-sub">the hat shop, again. but everything is more expensive.</p>
    `;
    host.appendChild(root);
    return () => {
      root.remove();
    };
  },
};
