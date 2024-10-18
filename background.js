let isDownloadPaused = false;
let currentDownloadIndex = 0;
let totalPhotos = 0;
let photoUrls = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processPhotoLinks') {
    photoUrls = request.photoUrls;
    totalPhotos = photoUrls.length;
    currentDownloadIndex = 0;
    processPhotoLinks(photoUrls);
  } else if (request.action === 'pause') {
    isDownloadPaused = true;
  } else if (request.action === 'resume') {
    isDownloadPaused = false;
    continueDownload();
  }
});

function getRandomDelay(min, max) {
  return Math.random() * (max - min) + min;
}

function formatTimestamp(date) {
  return date.getFullYear() +
         ('0' + (date.getMonth() + 1)).slice(-2) +
         ('0' + date.getDate()).slice(-2) +
         ('0' + date.getHours()).slice(-2) +
         ('0' + date.getMinutes()).slice(-2) +
         ('0' + date.getSeconds()).slice(-2);
}

async function processPhotoLinks(urls) {
  for (const url of urls) {
    if (isDownloadPaused) {
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(100, 500)));
      const tab = await chrome.tabs.create({ url: url, active: false });
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for the page to load
      
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: findFullSizeImage,
      });
      
      if (result && result.result) {
        await chrome.downloads.download({
          url: result.result,
          saveAs: false,
          conflictAction: 'uniquify'
        });
        currentDownloadIndex++;
        updateProgress();
      }
      
      await chrome.tabs.remove(tab.id);
    } catch (error) {
      console.error('Error processing photo:', error);
    }
  }
}

function findFullSizeImage() {
  const selectors = [
    'img.spotlight',
    'img[data-visualcompletion="media-vc-image"]',
    'img[data-visualcompletion="media-vc-image"][alt]',
    'div[role="dialog"] img',
    'div[role="presentation"] img'
  ];

  for (const selector of selectors) {
    const img = document.querySelector(selector);
    if (img && img.src) {
      return img.src;
    }
  }

  // If no image is found, try to extract from the page source
  const match = document.documentElement.innerHTML.match(/"image":{"uri":"([^"]+)"/);
  return match ? match[1].replace(/\\/g, '') : null;
}

function updateProgress() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateProgress",
        current: currentDownloadIndex,
        total: totalPhotos
      });
    }
  });
}

function continueDownload() {
  const remainingUrls = photoUrls.slice(currentDownloadIndex);
  processPhotoLinks(remainingUrls);
}

// Add this new event listener for renaming the file
chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  if (downloadItem.url.includes('fbcdn.net')) {
    const timestamp = formatTimestamp(new Date());
    const newFilename = `facebook_photo_${timestamp}.jpg`;
    suggest({ filename: newFilename, conflictAction: 'uniquify' });
  } else {
    suggest();
  }
});
