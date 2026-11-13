import type { SchemaData, SchemaValue } from '../types/seo';

type SchemaRecord = { [key: string]: SchemaValue };

function asRecord(value: SchemaValue): SchemaRecord | null {
  return value !== null && !Array.isArray(value) && typeof value === 'object' ? value : null;
}

function typeLabel(value: SchemaValue | undefined): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string').join(', ');
  return '';
}

function compactType(value: SchemaValue | undefined): string {
  return typeLabel(value).split(', ').map((entry) => {
    const parts = entry.split(/[\/#]/).filter(Boolean);
    return parts[parts.length - 1] ?? entry;
  }).join(', ');
}

function addJsonNodes(value: SchemaValue, schemas: SchemaData[]): void {
  if (Array.isArray(value)) {
    value.forEach((item) => addJsonNodes(item, schemas));
    return;
  }
  const record = asRecord(value);
  if (!record) return;
  if (record['@graph'] !== undefined) {
    addJsonNodes(record['@graph'], schemas);
    // A graph wrapper can also describe an item of its own.
    if (!record['@type']) return;
  }
  schemas.push({ type: typeLabel(record['@type']), format: 'JSON-LD', id: typeof record['@id'] === 'string' ? record['@id'] : undefined, properties: record });
}

function valueFromElement(element: Element): SchemaValue {
  if (element.hasAttribute('content')) return element.getAttribute('content') ?? '';
  if (element.hasAttribute('datetime')) return element.getAttribute('datetime') ?? '';
  for (const name of ['href', 'src', 'data', 'cite']) {
    if (element.hasAttribute(name)) {
      const raw = element.getAttribute(name) ?? '';
      try { return new URL(raw, element.ownerDocument.baseURI).href; } catch { return raw; }
    }
  }
  if (element.hasAttribute('value')) return element.getAttribute('value') ?? '';
  return (element.textContent ?? '').trim();
}

function appendProperty(target: SchemaRecord, key: string, value: SchemaValue): void {
  // Use own properties so a page's "__proto__" value cannot mutate the result.
  if (!Object.prototype.hasOwnProperty.call(target, key)) {
    Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true });
  } else {
    const current = target[key];
    target[key] = Array.isArray(current) ? [...current, value] : [current, value];
  }
}

function microdataItem(item: Element, seen: Set<Element>): SchemaRecord {
  const result: SchemaRecord = {};
  const type = item.getAttribute('itemtype');
  if (type) result['@type'] = type.trim().split(/\s+/);
  const id = item.getAttribute('itemid');
  if (id) result['@id'] = id;
  const visit = (element: Element): void => {
    if (seen.has(element)) return;
    seen.add(element);
    const names = element.getAttribute('itemprop')?.trim().split(/\s+/).filter(Boolean) ?? [];
    if (names.length) {
      const value = element.hasAttribute('itemscope') ? microdataItem(element, new Set()) : valueFromElement(element);
      names.forEach((name) => appendProperty(result, name, value));
    }
    if (element.hasAttribute('itemscope')) return;
    Array.from(element.children).forEach(visit);
  };
  Array.from(item.children).forEach(visit);
  const references = item.getAttribute('itemref')?.trim().split(/\s+/).filter(Boolean) ?? [];
  references.forEach((id) => {
    const referenced = item.ownerDocument.getElementById(id);
    if (referenced) visit(referenced);
  });
  return result;
}

function rdfaItem(item: Element): SchemaRecord {
  const result: SchemaRecord = { '@type': item.getAttribute('typeof')?.trim().split(/\s+/).join(', ') ?? '' };
  const id = item.getAttribute('about') || item.getAttribute('resource');
  if (id) result['@id'] = id;
  const visit = (parent: Element): void => {
    Array.from(parent.children).forEach((element) => {
      const names = (element.getAttribute('property') || element.getAttribute('rel') || '').trim().split(/\s+/).filter(Boolean);
      if (names.length) {
        const value = element.hasAttribute('typeof') ? rdfaItem(element) : (element.getAttribute('resource') ?? valueFromElement(element));
        names.forEach((name) => appendProperty(result, name, value));
      }
      if (!element.hasAttribute('typeof')) visit(element);
    });
  };
  visit(item);
  return result;
}

export function collectStructuredData(doc: Document): { schemas: SchemaData[]; invalidSchemaCount: number; jsonLdBlockCount: number } {
  const schemas: SchemaData[] = [];
  let invalidSchemaCount = 0;
  const scripts = doc.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]');
  scripts.forEach((script) => {
    try { addJsonNodes(JSON.parse(script.textContent ?? '') as SchemaValue, schemas); }
    catch { invalidSchemaCount += 1; }
  });

  doc.querySelectorAll('[itemscope]').forEach((item) => {
    if (item.parentElement?.closest('[itemscope]') && item.hasAttribute('itemprop')) return;
    const properties = microdataItem(item, new Set());
    schemas.push({ type: compactType(properties['@type']), format: 'Microdata', id: typeof properties['@id'] === 'string' ? properties['@id'] : undefined, properties });
  });
  doc.querySelectorAll('[typeof]').forEach((item) => {
    if (item.parentElement?.closest('[typeof]') && (item.hasAttribute('property') || item.hasAttribute('rel'))) return;
    const properties = rdfaItem(item);
    schemas.push({ type: compactType(properties['@type']), format: 'RDFa', id: typeof properties['@id'] === 'string' ? properties['@id'] : undefined, properties });
  });
  return { schemas, invalidSchemaCount, jsonLdBlockCount: scripts.length };
}
