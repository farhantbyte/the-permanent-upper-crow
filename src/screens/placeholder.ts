import type { Screen } from './types';

export const placeholderScreen: Screen = {
  mount(host) {
    const root = document.createElement('div');
    root.classList.add('screen', 'screen-placeholder');
    root.innerHTML = `
      <p class="placeholder-title">screen 3 — coming soon</p>
      <p class="placeholder-sub">you shipped it. the world is so back.</p>
    `;
    host.appendChild(root);
    return () => {
      root.remove();
    };
  },
};
