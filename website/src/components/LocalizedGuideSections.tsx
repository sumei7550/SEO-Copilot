import Link from 'next/link';
import { localizedPath, type Locale } from '@/lib/site';
import { localizedGuides, type GuidePath } from '@/lib/localized-guides';

function linkedText(text: string, locale: Locale) {
  return text.split(/(\[\[[^|\]]+\|[^\]]+\]\])/g).map((part, index) => {
    const match = /^\[\[([^|\]]+)\|([^\]]+)\]\]$/.exec(part);
    return match ? <Link href={localizedPath(locale, match[1])} key={index}>{match[2]}</Link> : part;
  });
}

export function LocalizedGuideSections({ locale, path }: { locale: Exclude<Locale, 'en'>; path: GuidePath }) {
  return <>{localizedGuides[locale][path].map((section, index) => <section key={index} aria-labelledby={`${path}-guide-${index}`}>
    <h2 id={`${path}-guide-${index}`}>{section.heading}</h2>
    {section.points.map(([heading, paragraphs], pointIndex) => <div key={pointIndex}>
      {heading && <h3>{heading}</h3>}
      {paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{linkedText(paragraph, locale)}</p>)}
    </div>)}
  </section>)}</>;
}
