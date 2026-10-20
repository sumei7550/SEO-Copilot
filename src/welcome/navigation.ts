export async function closeWelcomeTab(): Promise<void> {
  const tab = await chrome.tabs.getCurrent();
  if (tab?.id === undefined) throw new Error('welcome-tab-unavailable');
  await chrome.tabs.remove(tab.id);
}
