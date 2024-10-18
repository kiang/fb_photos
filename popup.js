let port = chrome.runtime.connect({name: "popup"});

port.onMessage.addListener(function(msg) {
  if (msg.action === "updateProgress") {
    updateProgress(msg.current, msg.total);
  }
});

function updateProgress(current, total) {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  const percentage = (current / total) * 100;
  progressBar.value = percentage;
  progressText.textContent = `${current} / ${total} photos downloaded`;
}

document.getElementById('pause-button').addEventListener('click', () => {
  port.postMessage({action: "pause"});
  document.getElementById('pause-button').disabled = true;
  document.getElementById('resume-button').disabled = false;
});

document.getElementById('resume-button').addEventListener('click', () => {
  port.postMessage({action: "resume"});
  document.getElementById('pause-button').disabled = false;
  document.getElementById('resume-button').disabled = true;
});
