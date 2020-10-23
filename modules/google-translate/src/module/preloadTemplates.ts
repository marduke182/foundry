export const preloadTemplates = async function () {
  const templatePaths = [`./modules/google-translate/templates/sheet-button.html`];

  return loadTemplates(templatePaths);
};
