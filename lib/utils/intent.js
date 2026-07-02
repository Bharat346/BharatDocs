export function handlePdfIntent(e, href) {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isAndroid) {
    e.preventDefault();
    const absoluteUrl = new URL(href, window.location.origin).href;
    const urlWithoutScheme = absoluteUrl.replace(/^https?:\/\//, '');
    const intentUrl = `intent://${urlWithoutScheme}#Intent;scheme=https;type=application/pdf;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(absoluteUrl)};end;`;
    window.location.href = intentUrl;
  } else if (isIOS) {
    e.preventDefault();
    const absoluteUrl = new URL(href, window.location.origin).href;
    
    if (navigator.share) {
      navigator.share({
        title: 'Open Document',
        url: absoluteUrl
      }).catch(() => {
        window.open(absoluteUrl, '_blank');
      });
    } else {
      window.open(absoluteUrl, '_blank');
    }
  }
}
