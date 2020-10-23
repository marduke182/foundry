import { registerSettings } from './module/settings';
import { initSheetButton } from './module/google-translate-sheet-button';
import { preloadTemplates } from './module/preloadTemplates';

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  // Register custom module settings
  registerSettings();
  await preloadTemplates();

  // CONFIG.debug.hooks=true
});

Hooks.once('ready', async () => {
  initSheetButton();
  console.log(CONFIG.JournalEntry);
});
