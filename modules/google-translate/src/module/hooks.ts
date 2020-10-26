import { preloadTemplates } from './hooks/init/preload-templates';
import { registerSettings } from './hooks/init/register-settings';
import { initSheetButton } from './hooks/ready/add-google-translate-sheet-button';

export function onReady(): void {
  initSheetButton();
}

export function onInit(): void {
  registerSettings();
  preloadTemplates();
}
