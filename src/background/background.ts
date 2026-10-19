chrome.runtime.onInstalled.addListener(() => chrome.storage.local.set({ lastInstalled: Date.now() }));

chrome.action.onClicked.addListener((tab) => {
  if (!tab.windowId) {
    console.error('SEO Copilot: action click did not include a browser window ID', tab);
    return;
  }

  chrome.sidePanel.open({ windowId: tab.windowId }).catch((error) => {
    console.error('SEO Copilot: failed to open the side panel from the action click', error);
  });
});
