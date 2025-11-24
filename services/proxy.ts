
export const fetchProxyContent = async (url: string): Promise<string> => {
  // Helper to inject base tag and navigation script
  const processContent = (html: string, baseUrl: string) => {
    if (!html) return '';
    
    // 1. Inject <base> tag so relative links (img src="/logo.png") work
    const baseTag = `<base href="${baseUrl}" target="_self">`;
    
    // 2. Inject Script to intercept clicks and route them through our app
    // This solves the issue where clicking a link inside the iframe would 
    // try to load the real site directly and get blocked by X-Frame-Options again.
    const scriptTag = `
      <script>
        document.addEventListener('click', function(e) {
          const link = e.target.closest('a');
          if (link && link.href) {
            // Check if it's an anchor link on the same page
            if (link.hash && link.href.split('#')[0] === window.location.href.split('#')[0]) {
               return; // Let default anchor behavior happen
            }
            
            e.preventDefault();
            // Send message to parent window (Nebula App)
            window.parent.postMessage({ type: 'NEBULA_NAVIGATE', url: link.href }, '*');
          }
        }, true);
      </script>
    `;

    let processed = html;

    // Inject Base Tag
    if (processed.toLowerCase().includes('<head>')) {
      processed = processed.replace(/<head>/i, `<head>${baseTag}`);
    } else {
      processed = `<html><head>${baseTag}</head>${processed}</html>`;
    }

    // Inject Navigation Script
    if (processed.toLowerCase().includes('</body>')) {
      processed = processed.replace(/<\/body>/i, `${scriptTag}</body>`);
    } else {
      processed = `${processed}${scriptTag}`;
    }

    return processed;
  };

  // --- PROXY STRATEGIES ---
  
  // Strategy 1: CodeTabs (Good for raw HTML)
  try {
    const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`);
    if (response.ok) {
      const text = await response.text();
      if (text.trim().length > 0) {
        return processContent(text, url);
      }
    }
  } catch (e) {
    console.warn("CodeTabs proxy failed, trying backup...", e);
  }

  // Strategy 2: AllOrigins (JSONP style, generally reliable)
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.contents) {
        return processContent(data.contents, url);
      }
    }
  } catch (e) {
    console.warn("AllOrigins proxy failed, trying backup...", e);
  }

  // Strategy 3: CorsProxy.io (Direct)
  try {
    const target = encodeURIComponent(url);
    const response = await fetch(`https://corsproxy.io/?${target}`);
    if (response.ok) {
      const text = await response.text();
      return processContent(text, url);
    }
  } catch (e) {
    console.warn("CorsProxy failed", e);
  }

  // Failure fallback
  return `
    <html>
      <body style="font-family: system-ui, -apple-system, sans-serif; display: flex; flex-col; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #334155;">
        <div style="text-align: center; padding: 20px; max-width: 500px;">
          <h2 style="color: #e11d48; margin-bottom: 16px;">Connection Failed</h2>
          <p style="margin-bottom: 20px; line-height: 1.5;">
            Nebula could not load <strong>${url}</strong> through the compatibility layer. 
            The site may have extremely strict bot protection.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center;">
             <button onclick="window.location.reload()" style="padding: 10px 20px; background: #cbd5e1; border: none; border-radius: 6px; cursor: pointer; color: #1e293b; font-weight: bold;">Retry</button>
             <a href="${url}" target="_blank" style="padding: 10px 20px; background: #3b82f6; text-decoration: none; border-radius: 6px; color: white; font-weight: bold;">Open in New Tab</a>
          </div>
        </div>
      </body>
    </html>
  `;
};
