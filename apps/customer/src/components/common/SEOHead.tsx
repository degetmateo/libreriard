import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  schemaJson?: Record<string, any>;
}

const DEFAULT_TITLE = 'Librería Rubén Darío | Artículos Escolares, Comerciales y Mayorista en Pacheco';
const DEFAULT_DESC = 'Librería Rubén Darío en General Pacheco: insumos escolares, comerciales y artísticos al por mayor y menor. Comprá online con retiro en local o envíos a todo el país.';
const BASE_URL = 'https://libreriard.com.ar';
const DEFAULT_IMAGE = `${BASE_URL}/logo.png`;

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = DEFAULT_DESC,
  canonicalPath = '',
  noIndex = false,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  schemaJson,
}) => {
  useEffect(() => {
    // 1. Document Title
    const fullTitle = title ? `${title} | Librería Rubén Darío` : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper to create or update meta tags
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Meta Description
    setMetaTag('name', 'description', description);

    // 3. Robots Tag
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // 4. Canonical Link
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`;
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    // 5. OpenGraph Tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:type', ogType);

    // 6. Twitter Card Tags
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 7. Optional JSON-LD Structured Data
    let scriptEl: HTMLScriptElement | null = null;
    if (schemaJson) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.id = 'dynamic-seo-schema';
      scriptEl.text = JSON.stringify(schemaJson);
      document.head.appendChild(scriptEl);
    }

    return () => {
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  }, [title, description, canonicalPath, noIndex, ogImage, ogType, schemaJson]);

  return null;
};

