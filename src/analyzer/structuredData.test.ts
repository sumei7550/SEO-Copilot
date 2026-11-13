// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { collectStructuredData } from './structuredData';

function fixture(body: string): Document {
  const doc = document.implementation.createHTMLDocument('Structured data');
  doc.body.innerHTML = body;
  return doc;
}

describe('structured data collection', () => {
  it('expands every @graph node while keeping nested properties and duplicate types', () => {
    const doc = fixture(`<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebPage","@id":"https://example.com/#page","breadcrumb":{"@type":"BreadcrumbList","itemListElement":[{"name":"Home"}]}},{"@type":"ImageObject","width":1200},{"@type":"ImageObject","width":600}]}</script>`);
    const result = collectStructuredData(doc);
    expect(result.jsonLdBlockCount).toBe(1);
    expect(result.schemas.map((item) => item.type)).toEqual(['WebPage', 'ImageObject', 'ImageObject']);
    expect(result.schemas[0].id).toBe('https://example.com/#page');
    expect(result.schemas[0].properties?.breadcrumb).toEqual({ '@type': 'BreadcrumbList', itemListElement: [{ name: 'Home' }] });
    expect(result.schemas[2].properties?.width).toBe(600);
  });

  it('isolates a malformed JSON-LD block from valid blocks', () => {
    const result = collectStructuredData(fixture('<script type="application/ld+json">{broken</script><script type="application/ld+json">{"@type":"Article"}</script>'));
    expect(result.invalidSchemaCount).toBe(1);
    expect(result.schemas.map((item) => item.type)).toEqual(['Article']);
  });

  it('collects nested Microdata and itemref properties', () => {
    const doc = fixture(`<div itemscope itemtype="https://schema.org/Product" itemid="https://example.com/p"><span itemprop="name">Camera</span><div itemprop="offers" itemscope itemtype="https://schema.org/Offer"><meta itemprop="price" content="99"></div></div><span id="extra" itemprop="sku">CAM-1</span>`);
    doc.querySelector('[itemscope]')?.setAttribute('itemref', 'extra');
    const result = collectStructuredData(doc);
    expect(result.schemas).toHaveLength(1);
    expect(result.schemas[0]).toMatchObject({ type: 'Product', format: 'Microdata', id: 'https://example.com/p' });
    expect(result.schemas[0].properties).toMatchObject({ '@type': ['https://schema.org/Product'], name: 'Camera', offers: { '@type': ['https://schema.org/Offer'], price: '99' }, sku: 'CAM-1' });
  });

  it('collects nested RDFa values and URLs', () => {
    const result = collectStructuredData(fixture('<div typeof="Product" about="https://example.com/p"><span property="name">Camera</span><a property="url" href="https://example.com/p">View</a><div property="offers" typeof="Offer"><meta property="price" content="99"></div></div>'));
    expect(result.schemas).toHaveLength(1);
    expect(result.schemas[0]).toMatchObject({ type: 'Product', format: 'RDFa', id: 'https://example.com/p' });
    expect(result.schemas[0].properties).toMatchObject({ name: 'Camera', url: 'https://example.com/p', offers: { '@type': 'Offer', price: '99' } });
  });
});
