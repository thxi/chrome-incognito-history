const tabs = {};

// windowID -> stack of closed tabs
const windows = {};

chrome.windows.onCreated.addListener((w) => {
  if (w.incognito) {
    console.log(`created window ${w.id}`);
    windows[w.id] = [];
    console.log({ windows });
  }
});

chrome.windows.onRemoved.addListener((windowID) => {
  console.log(`removed window ${windowID}`);
  delete windows[windowID];
  console.log({ windows });
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.windowId in windows) {
    console.log(`created tab ${tab.id}`);
    let { windowId, url } = tab;
    url = url ? url : tab.pendingUrl;
    tabs[tab.id] = { url, windowId };
    console.log(tabs);
  }
});

chrome.tabs.onUpdated.addListener((tabId, _info, tab) => {
  if (tabId in tabs) {
    console.log(`updated tab ${tab.id}`);
    let { windowId, url } = tab;
    url = url ? url : tab.pendingUrl;
    tabs[tab.id] = { url, windowId };
    console.log(tabs);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId in tabs) {
    console.log(`closed tab ${tabId}`);
    const tab = tabs[tabId];
    windows[tab.windowId].push(tab);
    delete tabs[tabId];
    console.log(tabs);
    console.log('windows', windows);
  }
});

chrome.commands.onCommand.addListener(function (command) {
  if (command === 'open-last-tab') {
    chrome.windows.getCurrent(undefined, ({ id }) => {
      const window = windows[id];
      const { url, windowId } = window.pop();
      chrome.tabs.create({ windowId, url, active: true });
    });
  }
});
