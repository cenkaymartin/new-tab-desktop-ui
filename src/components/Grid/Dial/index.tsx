import { observer } from "mobx-react-lite";
import { addOpacity } from "random-color-library";
import { useLayoutEffect, useRef, useState } from "react";

const FAVICON_CACHE_KEY = "bookmark_favicon_cache_v4";
const CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000;
const FAILED_CACHE_KEY = "bookmark_favicon_failed_v4";
const FAILED_CACHE_EXPIRY = 24 * 60 * 60 * 1000;

interface CacheEntry {
  url: string;
  timestamp: number;
  method: string;
  verified?: boolean;
}

interface FailedEntry {
  timestamp: number;
  method: string;
}

function getFaviconCache(): Record<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(FAVICON_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    
    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp > CACHE_EXPIRY) {
        delete cache[key];
      }
    });
    
    localStorage.setItem(FAVICON_CACHE_KEY, JSON.stringify(cache));
    return cache;
  } catch {
    return {};
  }
}

function getFailedCache(): Record<string, FailedEntry> {
  try {
    const raw = localStorage.getItem(FAILED_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    
    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp > FAILED_CACHE_EXPIRY) {
        delete cache[key];
      }
    });
    
    localStorage.setItem(FAILED_CACHE_KEY, JSON.stringify(cache));
    return cache;
  } catch {
    return {};
  }
}

function setFaviconCache(hostname: string, url: string, method: string, verified: boolean = false) {
  try {
    const cache = getFaviconCache();
    cache[hostname] = { url, timestamp: Date.now(), method, verified };
    localStorage.setItem(FAVICON_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function setFailedCache(hostname: string, method: string) {
  try {
    const cache = getFailedCache();
    cache[hostname] = { timestamp: Date.now(), method };
    localStorage.setItem(FAILED_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function getCleanHostname(url: string): string {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname.toLowerCase();
    
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    return hostname;
  } catch {
    return '';
  }
}

function getExtensionFaviconUrl(pageUrl: string, size: number = 32): string {
  try {
    const extensionId = chrome?.runtime?.id;
    if (!extensionId) {
      return '';
    }
    
    const url = new URL(`chrome-extension://${extensionId}/_favicon/`);
    url.searchParams.set("pageUrl", pageUrl);
    url.searchParams.set("size", size.toString());
    
    return url.toString();
  } catch (error) {
    return '';
  }
}

async function testBrowserFavicon(url: string, timeout: number = 3000): Promise<boolean> {
  try {
    if (!url.includes('chrome-extension://') || !url.includes('/_favicon/')) {
      return false;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'force-cache'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
    
  } catch (error) {
    return false;
  }
}

async function testFaviconUrl(url: string, timeout: number = 2000): Promise<boolean> {
  try {
    if (url.includes('chrome-extension://') && url.includes('/_favicon/')) {
      return testBrowserFavicon(url, timeout);
    }
    
    if (url.includes('google.com/s2/favicons') || 
        url.includes('duckduckgo.com') || 
        url.includes('icon.horse')) {
      return true;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors',
      cache: 'force-cache'
    });
    
    clearTimeout(timeoutId);
    return response.status === 0 || (response.status >= 200 && response.status < 400);
    
  } catch (error) {
    return false;
  }
}

async function getUltimateFavicon(url: string): Promise<string> {
  if (!url) return "";
  
  try {
    const urlObj = new URL(url);
    const hostname = getCleanHostname(url);
    const origin = urlObj.origin;
    
    const cache = getFaviconCache();
    const failedCache = getFailedCache();
    
    if (cache[hostname]) {
      const cached = cache[hostname];
      
      if (cached.method === 'browser-extension' && cached.verified) {
        return cached.url;
      }
      
      if (cached.method !== 'browser-extension') {
        return cached.url;
      }
    }
    
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        const extensionUrl = getExtensionFaviconUrl(url, 32);
        if (extensionUrl) {
          const isWorking = await testBrowserFavicon(extensionUrl, 4000);
          
          if (isWorking) {
            setFaviconCache(hostname, extensionUrl, 'browser-extension', true);
            return extensionUrl;
          } else {
            setFailedCache(hostname, 'browser-extension');
          }
        }
      } catch (error) {
        setFailedCache(hostname, 'browser-extension');
      }
    }
    
    if (failedCache[hostname] && failedCache[hostname].method === 'browser-extension') {
    }
    
    const fallbackStrategies = [
      async () => {
        const googleUrl = `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;
        return { url: googleUrl, method: 'google-service' };
      },
      
      async () => {
        const directUrls = [
          `${origin}/favicon.ico`,
          `${origin}/favicon.png`,
          `${origin}/apple-touch-icon.png`,
          `${origin}/favicon-32x32.png`
        ];
        
        for (const directUrl of directUrls) {
          if (await testFaviconUrl(directUrl, 1500)) {
            return { url: directUrl, method: 'direct-site' };
          }
        }
        return null;
      },
      
      async () => {
        const alternatives = [
          { url: `https://icons.duckduckgo.com/ip3/${hostname}.ico`, method: 'duckduckgo' },
          { url: `https://icon.horse/icon/${hostname}`, method: 'iconhorse' }
        ];
        
        for (const alt of alternatives) {
          if (await testFaviconUrl(alt.url, 2000)) {
            return alt;
          }
        }
        return null;
      }
    ];
    
    for (const strategy of fallbackStrategies) {
      try {
        const result = await strategy();
        if (result) {
          setFaviconCache(hostname, result.url, result.method);
          return result.url;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (hostname.includes('.') && hostname.split('.').length > 2) {
      const mainDomain = hostname.split('.').slice(-2).join('.');
      const mainDomainUrl = `https://www.google.com/s2/favicons?sz=32&domain=${mainDomain}`;
      setFaviconCache(hostname, mainDomainUrl, 'google-maindomain');
      return mainDomainUrl;
    }
    
    const ultimateFallback = `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;
    setFaviconCache(hostname, ultimateFallback, 'google-ultimate-fallback');
    return ultimateFallback;
    
  } catch (error) {
    try {
      const hostname = getCleanHostname(url);
      const errorFallback = `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;
      setFaviconCache(hostname, errorFallback, 'google-error-fallback');
      return errorFallback;
    } catch {
      return "";
    }
  }
}

function clearFaviconCache() {
  try {
    localStorage.removeItem(FAVICON_CACHE_KEY);
    localStorage.removeItem(FAILED_CACHE_KEY);
  } catch (error) {
  }
}

function getFaviconStats() {
  try {
    const cache = getFaviconCache();
    const failedCache = getFailedCache();
    
    const stats = {
      successful: Object.keys(cache).length,
      failed: Object.keys(failedCache).length,
      methods: {},
      browserApiSuccess: 0,
      browserApiVerified: 0
    };
    
    Object.values(cache).forEach(entry => {
      stats.methods[entry.method] = (stats.methods[entry.method] || 0) + 1;
      
      if (entry.method === 'browser-extension') {
        stats.browserApiSuccess++;
        if (entry.verified) {
          stats.browserApiVerified++;
        }
      }
    });
    
    return stats;
  } catch (error) {
    return null;
  }
}

export function exportFaviconCache() {
  try {
    const faviconCache = localStorage.getItem(FAVICON_CACHE_KEY);
    const failedCache = localStorage.getItem(FAILED_CACHE_KEY);
    
    return {
      faviconCache: faviconCache ? JSON.parse(faviconCache) : {},
      failedCache: failedCache ? JSON.parse(failedCache) : {},
      cacheVersion: "v4",
      exportTimestamp: Date.now()
    };
  } catch (error) {
    console.warn('Failed to export favicon cache:', error);
    return {
      faviconCache: {},
      failedCache: {},
      cacheVersion: "v4",
      exportTimestamp: Date.now()
    };
  }
}

export function importFaviconCache(cacheData: any) {
  try {
    if (!cacheData || typeof cacheData !== 'object') {
      console.warn('Invalid cache data provided');
      return false;
    }

    const { faviconCache, failedCache, cacheVersion } = cacheData;
    
    if (cacheVersion && cacheVersion !== "v4") {
      console.warn('Cache version mismatch, clearing old cache');
      clearFaviconCache();
    }
    
    if (faviconCache && typeof faviconCache === 'object') {
      localStorage.setItem(FAVICON_CACHE_KEY, JSON.stringify(faviconCache));
      console.log('Favicon cache restored:', Object.keys(faviconCache).length, 'entries');
    }
    
    if (failedCache && typeof failedCache === 'object') {
      localStorage.setItem(FAILED_CACHE_KEY, JSON.stringify(failedCache));
      console.log('Failed cache restored:', Object.keys(failedCache).length, 'entries');
    }
    
    return true;
  } catch (error) {
    console.warn('Failed to import favicon cache:', error);
    return false;
  }
}

export function refreshFaviconCache(urls: string[] = []) {
  try {
    clearFaviconCache();
    
    if (urls.length > 0) {
      urls.forEach(async (url) => {
        if (url) {
          try {
            await getUltimateFavicon(url);
          } catch (error) {
            console.warn('Failed to refresh favicon for:', url);
          }
        }
      });
      
      console.log('Favicon cache refresh initiated for', urls.length, 'URLs');
    }
    
    return true;
  } catch (error) {
    console.warn('Failed to refresh favicon cache:', error);
    return false;
  }
}

export function validateFaviconCache() {
  try {
    const cache = getFaviconCache();
    const failedCache = getFailedCache();
    const now = Date.now();
    
    let validEntries = 0;
    let expiredEntries = 0;
    let corruptedEntries = 0;
    
    Object.entries(cache).forEach(([hostname, entry]) => {
      try {
        if (!entry || typeof entry !== 'object' || !entry.url || !entry.timestamp) {
          corruptedEntries++;
          return;
        }
        
        if (now - entry.timestamp > CACHE_EXPIRY) {
          expiredEntries++;
        } else {
          validEntries++;
        }
      } catch {
        corruptedEntries++;
      }
    });
    
    return {
      valid: validEntries,
      expired: expiredEntries,
      corrupted: corruptedEntries,
      failed: Object.keys(failedCache).length,
      totalCached: validEntries + expiredEntries + corruptedEntries
    };
  } catch (error) {
    console.warn('Failed to validate favicon cache:', error);
    return null;
  }
}

(window as any).clearFaviconCache = clearFaviconCache;
(window as any).getFaviconStats = getFaviconStats;
(window as any).testBrowserFavicon = testBrowserFavicon;
(window as any).exportFaviconCache = exportFaviconCache;
(window as any).importFaviconCache = importFaviconCache;
(window as any).refreshFaviconCache = refreshFaviconCache;
(window as any).validateFaviconCache = validateFaviconCache;

const FaviconImage = observer(function FaviconImage({ url, title }: FaviconProps) {
  const [faviconUrl, setFaviconUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useLayoutEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setHasError(false);
    
    const loadFavicon = async () => {
      try {
        const result = await getUltimateFavicon(url);
        if (result) {
          setFaviconUrl(result);
          setLoading(false);
        } else {
          throw new Error('Favicon bulunamadÄ±');
        }
      } catch (error) {
        setHasError(true);
        setLoading(false);
      }
    };

    loadFavicon();
  }, [url, retryCount]);

  const handleImageError = async () => {
    if (faviconUrl && retryCount < 1) {
      try {
        const hostname = getCleanHostname(url || '');
        
        const cache = getFaviconCache();
        if (cache[hostname] && cache[hostname].method === 'browser-extension') {
          delete cache[hostname];
          localStorage.setItem(FAVICON_CACHE_KEY, JSON.stringify(cache));
          setFailedCache(hostname, 'browser-extension');
        }
        
        setRetryCount(prev => prev + 1);
        return;
      } catch {}
    }
    
    setHasError(true);
  };

  const handleImageLoad = () => {
    setHasError(false);
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100%",
        opacity: 0.7 
      }}>
        <div 
          style={{ 
            width: "16px", 
            height: "16px", 
            border: "2px solid currentColor",
            borderTop: "2px solid transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }}
        />
      </div>
    );
  }

  if (hasError || !faviconUrl) {
    const hostname = url ? getCleanHostname(url) : "";
    const siteName = title || hostname || "?";
    const firstLetter = siteName[0]?.toUpperCase() || "?";
    
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100%",
        fontSize: "20px",
        fontWeight: "700",
        color: "white",
        textShadow: "0 2px 4px rgba(0,0,0,0.8)"
      }}>
        {firstLetter}
      </div>
    );
  }

  return (
    <img
      src={faviconUrl}
      alt={title || ""}
      draggable={false}
      onError={handleImageError}
      onLoad={handleImageLoad}
      style={{ 
        width: "60%", 
        height: "60%", 
        objectFit: "contain",
        borderRadius: "3px",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
      }}
    />
  );
});

import { dialColors } from "#lib/dialColors";
import { contextMenu } from "#stores/useContextMenu";
import { settings } from "#stores/useSettings";

import "./styles.css";

interface DialProps {
  id: string;
  title?: string;
  name: string[] | string;
  type: "bookmark" | "folder";
  url?: string;
}

interface NameProps {
  name: string[];
}

interface SmallProps {
  align: string;
  children: React.ReactNode;
}

interface DomainProps {
  title?: boolean;
  padding?: boolean;
  children: React.ReactNode;
}

interface TitleProps {
  title?: string;
  name: string[] | string;
  url?: string;
}

interface FaviconProps {
  url?: string;
  title?: string;
}

export const Dial = observer(function Dial(props: DialProps) {
  const nameArray = Array.isArray(props.name) ? props.name : [props.name || props.title || ""];
  
  const backgroundColor = settings.dialColors[props.id]
    ? settings.transparentDials
      ? addOpacity(settings.dialColors[props.id], 0.75)
      : settings.dialColors[props.id]
    : settings.transparentDials
      ? addOpacity(dialColors(nameArray), 0.75)
      : dialColors(nameArray);
  const backgroundImage = settings.dialImages[props.id];

  return (
    <a
      href={props.type === "bookmark" ? props.url : `#${props.id}`}
      data-id={props.id}
      data-title={props.title}
      data-type={props.type}
      data-thumbnail={backgroundImage ? "" : null}
      rel={props.type === "bookmark" ? "noreferrer" : undefined}
      className="Link"
      target={
        props.type === "bookmark" && settings.newTab ? "_blank" : undefined
      }
      onContextMenu={contextMenu.openContextMenu}
    >
      <div
        className="Box"
        style={{
          backgroundColor,
          backgroundImage: backgroundImage
            ? `url("${backgroundImage}")`
            : undefined,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          textShadow:
            props.type !== "folder" ? "2px 1px 0 rgb(33,33,33,0.7)" : "none",
        }}
      >
        {!settings.dialImages[props.id] &&
        (props.type === "bookmark" ? (
          <FaviconImage url={props.url} title={props.title} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="folder"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M9.17 6l2 2H20v10H4V6h5.17M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
          </div>
        ))}
      </div>
      <Title {...{ title: props.title, name: props.name, url: props.url }} />
    </a>
  );
});

function Name(props: NameProps) {
  return props.name.length === 1 ? (
    <Domain {...{ title: true }}>{props.name.join(".")}</Domain>
  ) : props.name.length === 3 && props.name[0].length < props.name[1].length ? (
    <>
      <Small align="left" key={props.name[0]}>
        {props.name[0]}
      </Small>
      <Domain key={props.name[1]}>{props.name[1]}</Domain>
      <Small align="right" key={props.name[2]}>
        {props.name[2]}
      </Small>
    </>
  ) : props.name.length === 2 ? (
    <>
      <Domain padding={true} key={props.name[0]}>
        {props.name[0]}
      </Domain>
      <Small align="right" key={props.name[1]}>
        {props.name[1]}
      </Small>
    </>
  ) : props.name[0].length > props.name[1].length ||
    props.name[0].length === props.name[1].length ? (
    <>
      <Domain padding={true}>{props.name[0]}</Domain>
      <Small align="right">{props.name.slice(1).join(".")}</Small>
    </>
  ) : (
    <>
      <Small align="left">{props.name[0]}</Small>
      <Domain>{props.name[1]}</Domain>
      <Small align="right">{props.name.slice(2).join(".")}</Small>
    </>
  );
}

function Small(props: SmallProps) {
  return (
    <div
      className="Small"
      style={
        {
          "--name-align": props.align,
        } as React.CSSProperties
      }
    >
      <div>{props.children}</div>
    </div>
  );
}

function Domain(props: DomainProps) {
  const [scale, setScale] = useState<number | null>(null);
  const domainRef = useRef<HTMLDivElement>(null);
  
  useLayoutEffect(() => {
    const domainElement = domainRef.current;
    if (!domainElement) return;
    const boxElement = domainElement.closest(".Box") as HTMLElement;
    if (!boxElement) return;

    const calculateScale = () => {
      const domainWidth = domainElement.offsetWidth;
      const domainHeight = domainElement.offsetHeight;
      const boxWidth = boxElement.offsetWidth;
      const boxHeight = boxElement.offsetHeight;

      const maxWidth = boxWidth * 0.92;
      const maxHeight = boxHeight * 0.92;

      let newScale = null;
      if (domainHeight > maxHeight) {
        newScale = maxHeight / domainHeight;
      } else if (domainWidth > maxWidth) {
        newScale = maxWidth / domainWidth;
      }

      setScale(newScale);
    };

    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    resizeObserver.observe(domainElement);
    resizeObserver.observe(boxElement);

    calculateScale();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  return (
    <div
      ref={domainRef}
      className="Domain"
      style={
        {
          "--name-white-space": props.title ? "initial" : "nowrap",
          "--name-padding": props.title
            ? "0"
            : props.padding
              ? "1em 0 0"
              : "0 0",
          "--name-transform": scale ? `scale(${scale})` : "initial",
        } as React.CSSProperties
      }
    >
      <div>{props.children}</div>
    </div>
  );
}

const Title = observer(function Title(props: TitleProps) {
  if (!settings.showTitle) return null;

  const nameArray = Array.isArray(props.name) ? props.name : [props.name || props.title || ""];
  const displayName = nameArray.join(".");
  
  let displayText = "";
  
  if (settings.switchTitleAndURL || settings.switchTitle) {
    displayText = props.url || displayName;
  } else {
    displayText = props.title || displayName;
  }

  if (!displayText) return null;

  return (
    <div className="Title">
      <div className="title">
        <div>
          {displayText}
        </div>
      </div>
    </div>
  );
});

export { FaviconImage, getUltimateFavicon, clearFaviconCache, getFaviconStats };