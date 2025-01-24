// 缓存翻译结果
const translationCache = new Map();

function initI18n() {
  // 获取所有需要翻译的元素
  const elements = document.querySelectorAll('[data-i18n]');
  
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    let translation;
    
    if (translationCache.has(key)) {
      translation = translationCache.get(key);
    } else {
      translation = chrome.i18n.getMessage(key);
      translationCache.set(key, translation);
    }
    
    if (translation) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else if (element.tagName === 'OPTION') {
        element.textContent = translation;
      } else {
        element.textContent = translation;
      }
    }
  });
}

// 在 DOM 加载完成后初始化国际化
document.addEventListener('DOMContentLoaded', initI18n); 