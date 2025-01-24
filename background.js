chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'downloadImage') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const format = message.format || 'png';
      const filename = `webpage-${timestamp}.${format}`;
      
      chrome.downloads.download({
        url: message.imageData,
        filename: filename,
        saveAs: true
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error('Download failed:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError });
        } else if (downloadId === undefined) {
          // 用户取消了保存对话框
          console.log('User cancelled the save dialog');
          sendResponse({ success: false, cancelled: true });
        } else {
          sendResponse({ success: true, downloadId });
        }
      });
    } catch (error) {
      console.error('Error in download:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // 保持消息通道开放
  }
}); 