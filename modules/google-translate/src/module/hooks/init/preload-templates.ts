export const preloadTemplates = async (): Promise<void> => {
  const templatePaths = [`./modules/google-translate/templates/sheet-button.html`];

  return loadTemplates(templatePaths);
};
