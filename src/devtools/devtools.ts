// Register the DevTools panel
chrome.devtools.panels.create(
  'Manifests',
  '', // No icon yet
  'src/devtools/panel.html',
  (_panel) => {
    console.log('Manifest viewer panel created');
  }
);
