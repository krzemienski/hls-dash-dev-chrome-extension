// Register the DevTools panel
chrome.devtools.panels.create(
  'Manifests',
  '', // No icon yet
  'panel.html',
  (panel) => {
    console.log('Manifest viewer panel created');
  }
);
