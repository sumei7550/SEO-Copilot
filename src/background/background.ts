type AnalyticsMessage = {
  type: 'TRACK_ANALYTICS';
  event: string;
  distinctId: string;
  properties: Record<string, unknown>;
};

chrome.runtime.onInstalled.addListener(() => chrome.storage.local.set({ lastInstalled: Date.now() }));

chrome.runtime.onMessage.addListener((message: AnalyticsMessage, _sender, sendResponse) => {
  if (message?.type !== 'TRACK_ANALYTICS') return undefined;
  void sendMixpanelEvent(message)
    .then(() => sendResponse({ ok: true }))
    .catch(() => sendResponse({ ok: false }));
  return true;
});

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function sendMixpanelEvent(message: AnalyticsMessage): Promise<void> {
  const token = import.meta.env.VITE_MIXPANEL_TOKEN;
  if (!token) return;
  const payload = {
    event: message.event,
    properties: { ...message.properties, token, distinct_id: message.distinctId },
  };
  const body = new URLSearchParams({ data: encodeBase64(JSON.stringify(payload)) });
  const response = await fetch('https://api-js.mixpanel.com/track?verbose=1&ip=0', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!response.ok) throw new Error(`Mixpanel request failed: ${response.status}`);
}
