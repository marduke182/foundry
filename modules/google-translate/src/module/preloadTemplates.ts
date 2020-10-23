export const preloadTemplates = async function () {
  const templatePaths = [
    // Add paths to "modules/dynamiceffects/templates"
    `./modules/google-translate/templates/sheet-button.html`,
  ];

  return loadTemplates(templatePaths);
};
