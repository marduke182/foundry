import { preloadTemplates } from './hooks/init/preload-templates';
import { registerSettings } from './hooks/init/register-settings';
import { initSheetButton } from './hooks/ready/add-google-translate-sheet-button';
import { createConpendium } from './hooks/ready/create-compendium';

export function onReady(): void {
  initSheetButton();
  createConpendium();
}

export function onInit(): void {
  registerSettings();
  preloadTemplates();
}
