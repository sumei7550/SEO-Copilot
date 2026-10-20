chrome.runtime.onInstalled.addListener((details) => {
  void chrome.storage.local.set({ lastInstalled: Date.now() });
  if (details.reason !== 'install') return;
  void chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') }).catch((error) => {
    console.error('SEO Copilot: failed to open the welcome page', error);
  });
});

chrome.action.onClicked.addListener((tab) => {
  if (!tab.windowId) {
    console.error('SEO Copilot: action click did not include a browser window ID', tab);
    return;
  }

  chrome.sidePanel.open({ windowId: tab.windowId }).catch((error) => {
    console.error('SEO Copilot: failed to open the side panel from the action click', error);
  });
});

export {};
