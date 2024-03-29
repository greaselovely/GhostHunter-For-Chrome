// background.js

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.message === "getDomainData") {
          chrome.storage.local.get({ uniqueDomains: [] }, function(result) {
            console.log("Sending domains:", result.uniqueDomains); // For debugging  
            sendResponse({ data: result.uniqueDomains });
          });
          return true;
      } else if (request.message === "clearDomainData") {
          // Clear the stored domain data
          chrome.storage.local.set({ uniqueDomains: [] }, function() {
              sendResponse({ success: true });
          });
          return true; 
      }
  }
);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url && (changeInfo.url.startsWith('http://') || changeInfo.url.startsWith('https://'))) {
      let url = new URL(changeInfo.url);
      let domain = url.hostname;

      chrome.storage.local.get({ uniqueDomains: [] }, function(result) {
          let domains = new Set(result.uniqueDomains);
          domains.add(domain);
          chrome.storage.local.set({ uniqueDomains: Array.from(domains) });
      });
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
      if (details.url.startsWith('http://') || details.url.startsWith('https://')) {
          let url = new URL(details.url);
          let domain = url.hostname;

          chrome.storage.local.get({ uniqueDomains: [] }, function(result) {
              let domains = new Set(result.uniqueDomains);
              domains.add(domain);
              chrome.storage.local.set({ uniqueDomains: Array.from(domains) });
          });
      }
  },
  { urls: ["<all_urls>"] }
);
