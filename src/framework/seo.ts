import { Injectable } from './di';

export interface MetaDefinition {
    name?: string;
    property?: string;
    httpEquiv?: string;
    content: string;
    [prop: string]: any;
}

export interface OpenGraphConfig {
    title?: string;
    description?: string;
    url?: string;
    type?: string;
    image?: string;
    imageSecureUrl?: string;
    imageType?: string;
    imageWidth?: number | string;
    imageHeight?: number | string;
    imageAlt?: string;
    siteName?: string;
    locale?: string;
    [prop: string]: any;
}

export interface TwitterCardConfig {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player' | string;
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
    [prop: string]: any;
}

export interface RobotsOptions {
    index?: boolean;
    follow?: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
    maxSnippet?: number;
    maxImagePreview?: 'none' | 'standard' | 'large';
    maxVideoPreview?: number;
}

export interface SeoConfig {
    title?: string;
    titlePrefix?: string;
    titleSuffix?: string;
    description?: string;
    keywords?: string | string[];
    author?: string;
    canonical?: string;
    robots?: RobotsOptions | string;
    og?: OpenGraphConfig;
    twitter?: TwitterCardConfig;
    jsonLd?: Record<string, any> | Array<Record<string, any>>;
    metaTags?: MetaDefinition[];
}

/**
 * Purity Framework SEO & Head Metadata Service
 * Fine-grained service managing document titles, canonical links, OpenGraph, Twitter Cards,
 * meta tags, robots directives, and Schema.org JSON-LD structured data.
 */
@Injectable('SeoService')
export class SeoService {
    private defaultSiteName = 'Purity';
    private currentConfig: SeoConfig = {};

    /**
     * Updates the document title and synchronized title meta tags.
     */
    setTitle(title: string, options?: { prefix?: string; suffix?: string; separator?: string }): void {
        if (typeof document === 'undefined') return;

        const sep = options?.separator || ' - ';
        let fullTitle = title;

        if (options?.prefix) {
            fullTitle = `${options.prefix}${sep}${fullTitle}`;
        }
        if (options?.suffix) {
            fullTitle = `${fullTitle}${sep}${options.suffix}`;
        }

        document.title = fullTitle;
        this.updateTag({ name: 'title', content: fullTitle });
        this.updateTag({ property: 'og:title', content: fullTitle });
        this.updateTag({ name: 'twitter:title', content: fullTitle });

        this.currentConfig.title = fullTitle;
    }

    /**
     * Returns the current document title.
     */
    getTitle(): string {
        return typeof document !== 'undefined' ? document.title : '';
    }

    /**
     * Updates the meta description across primary, OpenGraph, and Twitter tags.
     */
    setDescription(description: string): void {
        this.updateTag({ name: 'description', content: description });
        this.updateTag({ property: 'og:description', content: description });
        this.updateTag({ name: 'twitter:description', content: description });
        this.currentConfig.description = description;
    }

    /**
     * Updates the meta keywords tag.
     */
    setKeywords(keywords: string | string[]): void {
        const keywordsStr = Array.isArray(keywords) ? keywords.join(', ') : keywords;
        this.updateTag({ name: 'keywords', content: keywordsStr });
        this.currentConfig.keywords = keywordsStr;
    }

    /**
     * Updates or creates the canonical link tag and corresponding URL tags.
     */
    setCanonicalUrl(url: string): void {
        if (typeof document === 'undefined') return;

        let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }
        link.setAttribute('href', url);

        this.updateTag({ property: 'og:url', content: url });
        this.updateTag({ name: 'twitter:url', content: url });
        this.currentConfig.canonical = url;
    }

    /**
     * Configures crawler indexing and robots directives.
     */
    setRobots(options: RobotsOptions | string): void {
        if (typeof options === 'string') {
            this.updateTag({ name: 'robots', content: options });
            this.currentConfig.robots = options;
            return;
        }

        const directives: string[] = [];
        directives.push(options.index === false ? 'noindex' : 'index');
        directives.push(options.follow === false ? 'nofollow' : 'follow');

        if (options.noarchive) directives.push('noarchive');
        if (options.nosnippet) directives.push('nosnippet');
        if (options.maxSnippet !== undefined) directives.push(`max-snippet:${options.maxSnippet}`);
        if (options.maxImagePreview) directives.push(`max-image-preview:${options.maxImagePreview}`);
        if (options.maxVideoPreview !== undefined) directives.push(`max-video-preview:${options.maxVideoPreview}`);

        const robotsContent = directives.join(', ');
        this.updateTag({ name: 'robots', content: robotsContent });
        this.currentConfig.robots = options;
    }

    /**
     * Configures Open Graph metadata tags for rich social media sharing previews.
     */
    setOpenGraph(og: OpenGraphConfig): void {
        if (og.title) this.updateTag({ property: 'og:title', content: og.title });
        if (og.description) this.updateTag({ property: 'og:description', content: og.description });
        if (og.url) this.updateTag({ property: 'og:url', content: og.url });
        if (og.type) this.updateTag({ property: 'og:type', content: og.type || 'website' });
        if (og.siteName) this.updateTag({ property: 'og:site_name', content: og.siteName || this.defaultSiteName });
        if (og.locale) this.updateTag({ property: 'og:locale', content: og.locale || 'en_US' });

        if (og.image) {
            this.updateTag({ property: 'og:image', content: og.image });
            if (og.imageSecureUrl || og.image.startsWith('https://')) {
                this.updateTag({ property: 'og:image:secure_url', content: og.imageSecureUrl || og.image });
            }
            if (og.imageType) this.updateTag({ property: 'og:image:type', content: og.imageType });
            if (og.imageWidth) this.updateTag({ property: 'og:image:width', content: String(og.imageWidth) });
            if (og.imageHeight) this.updateTag({ property: 'og:image:height', content: String(og.imageHeight) });
            if (og.imageAlt) this.updateTag({ property: 'og:image:alt', content: og.imageAlt });
        }

        // Custom extra OG properties
        for (const [key, val] of Object.entries(og)) {
            if (!['title', 'description', 'url', 'type', 'siteName', 'locale', 'image', 'imageSecureUrl', 'imageType', 'imageWidth', 'imageHeight', 'imageAlt'].includes(key) && val !== undefined) {
                const prop = key.startsWith('og:') ? key : `og:${key}`;
                this.updateTag({ property: prop, content: String(val) });
            }
        }

        this.currentConfig.og = { ...this.currentConfig.og, ...og };
    }

    /**
     * Configures Twitter Card metadata tags.
     */
    setTwitterCard(twitter: TwitterCardConfig): void {
        this.updateTag({ name: 'twitter:card', content: twitter.card || 'summary' });
        if (twitter.site) this.updateTag({ name: 'twitter:site', content: twitter.site });
        if (twitter.creator) this.updateTag({ name: 'twitter:creator', content: twitter.creator });
        if (twitter.title) this.updateTag({ name: 'twitter:title', content: twitter.title });
        if (twitter.description) this.updateTag({ name: 'twitter:description', content: twitter.description });
        if (twitter.image) this.updateTag({ name: 'twitter:image', content: twitter.image });
        if (twitter.imageAlt) this.updateTag({ name: 'twitter:image:alt', content: twitter.imageAlt });

        // Custom extra Twitter properties
        for (const [key, val] of Object.entries(twitter)) {
            if (!['card', 'site', 'creator', 'title', 'description', 'image', 'imageAlt'].includes(key) && val !== undefined) {
                const name = key.startsWith('twitter:') ? key : `twitter:${key}`;
                this.updateTag({ name, content: String(val) });
            }
        }

        this.currentConfig.twitter = { ...this.currentConfig.twitter, ...twitter };
    }

    /**
     * Injects or updates a Schema.org JSON-LD structured data script.
     */
    setJsonLd(schema: Record<string, any> | Array<Record<string, any>>, id: string = 'purity-jsonld-schema'): void {
        if (typeof document === 'undefined') return;

        let script = document.getElementById(id) as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = id;
            document.head.appendChild(script);
        }

        script.textContent = JSON.stringify(schema, null, 2);
        this.currentConfig.jsonLd = schema;
    }

    /**
     * Updates an existing meta tag or creates a new one if it does not exist.
     */
    updateTag(tag: MetaDefinition): HTMLMetaElement | null {
        if (typeof document === 'undefined') return null;

        const selector = this.buildTagSelector(tag);
        let element: HTMLMetaElement | null = selector ? document.querySelector(selector) : null;

        if (!element) {
            element = document.createElement('meta');
            document.head.appendChild(element);
        }

        for (const [key, value] of Object.entries(tag)) {
            if (value !== undefined && value !== null) {
                element.setAttribute(key, String(value));
            }
        }

        return element;
    }

    /**
     * Finds and returns a matching meta tag by CSS selector.
     */
    getTag(attrSelector: string): HTMLMetaElement | null {
        if (typeof document === 'undefined') return null;
        const selector = attrSelector.startsWith('meta[') ? attrSelector : `meta[${attrSelector}]`;
        return document.querySelector(selector);
    }

    /**
     * Removes a meta tag matching the given attribute selector.
     */
    removeTag(attrSelector: string): void {
        if (typeof document === 'undefined') return;
        const selector = attrSelector.startsWith('meta[') ? attrSelector : `meta[${attrSelector}]`;
        const element = document.querySelector(selector);
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    /**
     * Batch updates full SEO metadata for a route, page, or view.
     */
    setSeo(config: SeoConfig): void {
        if (config.title) {
            this.setTitle(config.title, {
                prefix: config.titlePrefix,
                suffix: config.titleSuffix,
            });
        }
        if (config.description) {
            this.setDescription(config.description);
        }
        if (config.keywords) {
            this.setKeywords(config.keywords);
        }
        if (config.author) {
            this.updateTag({ name: 'author', content: config.author });
        }
        if (config.canonical) {
            this.setCanonicalUrl(config.canonical);
        }
        if (config.robots) {
            this.setRobots(config.robots);
        }
        if (config.og) {
            this.setOpenGraph(config.og);
        }
        if (config.twitter) {
            this.setTwitterCard(config.twitter);
        }
        if (config.jsonLd) {
            this.setJsonLd(config.jsonLd);
        }
        if (config.metaTags && Array.isArray(config.metaTags)) {
            for (const tag of config.metaTags) {
                this.updateTag(tag);
            }
        }
    }

    /**
     * Returns the active SEO metadata snapshot.
     */
    getSeo(): SeoConfig {
        return { ...this.currentConfig };
    }

    /**
     * Generates a precise CSS selector to locate an existing meta tag.
     */
    private buildTagSelector(tag: MetaDefinition): string | null {
        if (tag.name) return `meta[name="${tag.name}"]`;
        if (tag.property) return `meta[property="${tag.property}"]`;
        if (tag.httpEquiv) return `meta[http-equiv="${tag.httpEquiv}"]`;
        return null;
    }
}

/**
 * MetaService is an alias for SeoService to support standard metadata naming conventions.
 */
@Injectable('MetaService')
export class MetaService extends SeoService {}
