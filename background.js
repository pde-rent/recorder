chrome.runtime.onInstalled.addListener(() => {
  chrome.action.onClicked.addListener(() => {
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 800,
      height: 600
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startCapture") {
    chrome.desktopCapture.chooseDesktopMedia(
      ["screen", "window", "tab", "audio"],
      sender.tab,
      (streamId) => {
        if (streamId) {
          sendResponse({ streamId: streamId });
        } else {
          sendResponse({ error: "Failed to get stream ID" });
        }
      }
    );
    return true; // Keep the message channel open for sendResponse
  }
});