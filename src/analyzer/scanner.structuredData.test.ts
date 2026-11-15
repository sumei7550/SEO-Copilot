// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { scanPage } from './scanner';

describe('scanPage structured data integration', () => {
  it('carries JSON-LD, Microdata and RDFa from the live DOM into PageData', () => {
    const doc = document.implementation.createHTMLDocument('Mixed structured data');
    doc.head.innerHTML = `
      <title>Mixed structured data</title>
      <meta name="description" content="A page containing all three Google-supported structured data formats.">
      <link rel="canonical" href="https://example.com/mixed">
    `;
    doc.body.innerHTML = `
      <h1>Mixed structured data</h1>
      <script type="application/ld+json">
        {"@context":"https://schema.org","@type":"WebPage","name":"JSON-LD page"}
      </script>
      <article itemscope itemtype="https://schema.org/Product" itemid="https://example.com/product">
        <span itemprop="name">Microdata product</span>
        <meta itemprop="sku" content="MICRO-1">
      </article>
      <section vocab="https://schema.org/" typeof="Organization" about="https://example.com/#organization">
        <span property="name">RDFa organization</span>
        <a property="url" href="https://example.com/">Home</a>
      </section>
    `;

    const page = scanPage(
      doc,
      { href: 'https://example.com/mixed' } as Location,
      { getEntriesByType: () => [] } as unknown as Performance
    );

    expect(page.jsonLdBlockCount).toBe(1);
    expect(page.schemas.map(({ type, format }) => ({ type, format }))).toEqual([
      { type: 'WebPage', format: 'JSON-LD' },
      { type: 'Product', format: 'Microdata' },
      { type: 'Organization', format: 'RDFa' }
    ]);
    expect(page.schemas[0].properties).toMatchObject({ name: 'JSON-LD page' });
    expect(page.schemas[1].properties).toMatchObject({ name: 'Microdata product', sku: 'MICRO-1' });
    expect(page.schemas[2].properties).toMatchObject({ name: 'RDFa organization', url: 'https://example.com/' });
  });
});
