chrome.runtime.onInstalled.addListener(() => chrome.storage.local.set({ lastInstalled: Date.now() }));
