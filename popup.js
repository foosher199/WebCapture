// 帮助按钮点击处理
document.getElementById('helpBtn').addEventListener('click', (event) => {
  event.stopPropagation(); // 阻止事件冒泡
  const helpContent = document.getElementById('helpContent');
  helpContent.classList.toggle('show');
});

// 点击其他地方关闭帮助框
document.addEventListener('click', (event) => {
  const helpContent = document.getElementById('helpContent');
  const helpBtn = document.getElementById('helpBtn');
  if (!helpBtn.contains(event.target) && !helpContent.contains(event.target)) {
    helpContent.classList.remove('show');
  }
});

// 添加防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 优化截图函数
document.getElementById('captureBtn').addEventListener('click', debounce(async () => {
  const captureBtn = document.getElementById('captureBtn');
  captureBtn.classList.add('loading');  // 添加加载状态
  const originalText = chrome.i18n.getMessage('saveAsImage');
  captureBtn.textContent = chrome.i18n.getMessage('savingImage');
  captureBtn.disabled = true;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const format = document.getElementById('formatSelect').value;
  const mode = document.getElementById('modeSelect').value;
  
  try {
    if (mode === 'visible') {
      // 仅截取可视区域
      const dataUrl = await chrome.tabs.captureVisibleTab(null, {
        format: format === 'png' ? 'png' : 'jpeg',
        quality: format === 'jpg' ? 85 : 100  // JPG使用85%的质量，其他格式使用100%
      });

      // 如果需要SVG格式，转换截图
      if (format === 'svg') {
        const img = new Image();
        img.onload = function() {
          const svg = convertToSVG(img);
          const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
          const svgUrl = URL.createObjectURL(svgBlob);
          
          chrome.runtime.sendMessage({ 
            type: 'downloadImage',
            imageData: svgUrl,
            format: 'svg'
          }, () => {
            // 恢复按钮状态
            captureBtn.textContent = originalText;
            captureBtn.disabled = false;
            captureBtn.classList.remove('loading');
          });
        };
        img.src = dataUrl;
      } else {
        chrome.runtime.sendMessage({ 
          type: 'downloadImage',
          imageData: dataUrl,
          format: format
        }, (response) => {
          // 恢复按钮状态
          captureBtn.textContent = originalText;
          captureBtn.disabled = false;
          captureBtn.classList.remove('loading');
        });
      }
    } else {
      // 整页截图的原有逻辑
      // 首先注入html2canvas库
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['lib/html2canvas.min.js']
      });

      // 注入一个函数来处理截图完成后的回调
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: (format) => {
          return new Promise((resolve, reject) => {
            const scrollHeight = Math.max(
              document.documentElement.scrollHeight,
              document.body.scrollHeight
            );
            const scrollWidth = Math.max(
              document.documentElement.scrollWidth,
              document.body.scrollWidth
            );

            html2canvas(document.documentElement, {
              height: scrollHeight,
              width: scrollWidth,
              scrollX: 0,
              scrollY: 0,
              windowHeight: scrollHeight,
              windowWidth: scrollWidth,
              useCORS: true,
              allowTaint: true,
              backgroundColor: null,
              imageTimeout: 15000,
              scale: window.devicePixelRatio,
              onclone: (clonedDoc) => {
                clonedDoc.documentElement.style.overflow = 'hidden';
              }
            }).then(canvas => {
              const imageType = format === 'jpg' ? 'image/jpeg' : 'image/png';
              const quality = format === 'jpg' ? 0.85 : 1.0;
              resolve(canvas.toDataURL(imageType, quality));
            }).catch(reject);
          });
        },
        args: [format]
      }).then(async ([{result: dataUrl}]) => {
        if (format === 'svg') {
          const img = new Image();
          img.onload = function() {
            const svg = convertToSVG(img);
            const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            chrome.runtime.sendMessage({ 
              type: 'downloadImage',
              imageData: svgUrl,
              format: 'svg'
            }, () => {
              // 恢复按钮状态
              captureBtn.textContent = originalText;
              captureBtn.disabled = false;
              captureBtn.classList.remove('loading');
            });
          };
          img.src = dataUrl;
        } else {
          chrome.runtime.sendMessage({ 
            type: 'downloadImage',
            imageData: dataUrl,
            format: format
          }, (response) => {
            // 恢复按钮状态
            captureBtn.textContent = originalText;
            captureBtn.disabled = false;
            captureBtn.classList.remove('loading');
          });
        }
      });
    }
  } catch (err) {
    console.error('Failed to capture:', err);
    // 添加用户友好的错误提示
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: chrome.i18n.getMessage('captureErrorTitle'),
      message: chrome.i18n.getMessage('captureError')
    });
    // 发生错误时也要恢复按钮状态
    captureBtn.textContent = originalText;
    captureBtn.disabled = false;
    captureBtn.classList.remove('loading');
  }
}, 300));

function convertToSVG(source) {
  const canvas = document.createElement('canvas');
  const width = source instanceof HTMLCanvasElement ? source.width : source.width;
  const height = source instanceof HTMLCanvasElement ? source.height : source.height;
  
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0);
  
  return `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="${width}" height="${height}" xlink:href="${canvas.toDataURL('image/png')}"/>
</svg>`;
}

// 添加性能监控
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Performance:', entry.name, entry.duration);
  }
});

performanceObserver.observe({ entryTypes: ['measure'] }); 