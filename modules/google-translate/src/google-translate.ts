import { onInit, onReady } from './module/hooks';

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  onInit();
  // CONFIG.debug.hooks=true
});

Hooks.once('ready', async () => {
  onReady();
});
