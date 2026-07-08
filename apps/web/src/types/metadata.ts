/**
 * Metadata types for SEO and social sharing.
 */

/** SEO properties for individual pages */
export interface SeoProps {
  readonly title: string;
  readonly description: string;
  readonly canonical?: string;
  readonly noIndex?: boolean;
}

/** OpenGraph data for social sharing */
export interface OpenGraphData {
  readonly title: string;
  readonly description: string;
  readonly url?: string;
  readonly siteName?: string;
  readonly images?: readonly OpenGraphImage[];
  readonly locale?: string;
  readonly type?: 'website' | 'article';
}

/** OpenGraph image */
export interface OpenGraphImage {
  readonly url: string;
  readonly width?: number;
  readonly height?: number;
  readonly alt?: string;
}
