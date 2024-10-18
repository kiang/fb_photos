let isDownloadPaused = false;
let currentDownloadIndex = 0;
let totalPhotos = 0;

function addDownloadControls() {
  if (!document.getElementById('fb-photo-downloader-controls')) {
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'fb-photo-downloader-controls';
    controlsContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px;
      background-color: #ffffff;
      border: 1px solid #dddfe2;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 9999;
    `;

    const downloadBtn = createButton('Download All Photos', startDownload);
    const pauseBtn = createButton('Pause', pauseDownload);
    pauseBtn.id = 'fb-photo-downloader-pause';
    const resumeBtn = createButton('Resume', resumeDownload);
    resumeBtn.id = 'fb-photo-downloader-resume';
    resumeBtn.style.display = 'none';

    const progressBar = document.createElement('progress');
    progressBar.id = 'fb-photo-downloader-progress';
    progressBar.style.width = '100%';
    progressBar.value = 0;
    progressBar.max = 100;

    const progressText = document.createElement('p');
    progressText.id = 'fb-photo-downloader-progress-text';
    progressText.textContent = '0 / 0 photos downloaded';
    progressText.style.margin = '5px 0';

    controlsContainer.appendChild(downloadBtn);
    controlsContainer.appendChild(pauseBtn);
    controlsContainer.appendChild(resumeBtn);
    controlsContainer.appendChild(progressBar);
    controlsContainer.appendChild(progressText);

    document.body.appendChild(controlsContainer);
  }
}

function createButton(text, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.style.cssText = `
    margin-right: 5px;
    padding: 5px 10px;
    background-color: #4267B2;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.3s;
  `;
  button.addEventListener('click', onClick);
  return button;
}

function startDownload() {
  const photoLinks = Array.from(document.querySelectorAll('a[href*="photo.php"]'));
  const photoUrls = photoLinks.map(link => link.href);
  totalPhotos = photoUrls.length;
  currentDownloadIndex = 0;
  updateProgress();
  chrome.runtime.sendMessage({ action: 'processPhotoLinks', photoUrls: photoUrls });
  
  document.getElementById('fb-photo-downloader-pause').style.display = 'inline-block';
  document.getElementById('fb-photo-downloader-resume').style.display = 'none';
}

function pauseDownload() {
  isDownloadPaused = true;
  chrome.runtime.sendMessage({ action: 'pause' });
  const pauseBtn = document.getElementById('fb-photo-downloader-pause');
  const resumeBtn = document.getElementById('fb-photo-downloader-resume');
  pauseBtn.style.display = 'none';
  resumeBtn.style.display = 'inline-block';
  resumeBtn.style.backgroundColor = '#4267B2';
  resumeBtn.style.color = 'white';
}

function resumeDownload() {
  isDownloadPaused = false;
  chrome.runtime.sendMessage({ action: 'resume' });
  const pauseBtn = document.getElementById('fb-photo-downloader-pause');
  const resumeBtn = document.getElementById('fb-photo-downloader-resume');
  pauseBtn.style.display = 'inline-block';
  pauseBtn.style.backgroundColor = '#4267B2';
  pauseBtn.style.color = 'white';
  resumeBtn.style.display = 'none';
}

function updateProgress() {
  const progressBar = document.getElementById('fb-photo-downloader-progress');
  const progressText = document.getElementById('fb-photo-downloader-progress-text');
  
  const percentage = (currentDownloadIndex / totalPhotos) * 100;
  progressBar.value = percentage;
  progressText.textContent = `${currentDownloadIndex} / ${totalPhotos} photos downloaded`;
}

// Add the download controls
addDownloadControls();

// Use a MutationObserver to ensure the controls stay on the page
const observer = new MutationObserver(() => {
  addDownloadControls();
});
observer.observe(document.body, { childList: true, subtree: true });

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getFullSizeImage') {
    const fullSizeImg = findFullSizeImage();
    sendResponse({ imageUrl: fullSizeImg });
    return true; // Indicates that the response is sent asynchronously
  } else if (request.action === 'updateProgress') {
    currentDownloadIndex = request.current;
    totalPhotos = request.total;
    updateProgress();
  }
});

function findFullSizeImage() {
  // Try different selectors to find the full-size image
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
