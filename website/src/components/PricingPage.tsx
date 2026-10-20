import Link from 'next/link';
import { StoreCta } from './StoreCta';
import { getPricingCopy } from '@/lib/pricing';
import { localizedPath, type Locale } from '@/lib/site';

export function PricingPage({ locale }: { locale: Locale }) {
  const c = getPricingCopy(locale);
  const plans = [
    { name: c.freeName, status: c.available, description: c.freeDescription, features: c.freeFeatures, free: true },
    { name: c.dayName, status: c.soon, description: c.dayDescription, features: c.paidFeatures, free: false },
    { name: c.weekName, status: c.soon, description: c.weekDescription, features: c.paidFeatures, free: false },
  ];
  const rows = c.comparison.map((label, index) => ({
    label,
    free: index < 4 ? c.included : index < 6 ? c.limited : index === 6 ? c.currentLimits : c.notApplicable,
    paid: index < 4 ? c.included : index < 6 ? c.planned : index === 6 ? c.plannedLimits : c.toConfirm,
  }));

  return <main className="pricing-page">
    <section className="pricing-hero"><div className="wrap pricing-hero-inner">
      <p className="eyebrow">{c.eyebrow}</p><h1>{c.hero}</h1><p className="pricing-lead">{c.intro}</p>
      <div className="actions"><StoreCta label={c.install} /><Link className="button button-secondary" href={localizedPath(locale, 'features')}>{c.featuresLink}</Link></div>
    </div></section>

    <section className="section" aria-labelledby="pricing-plans"><div className="wrap">
      <div className="section-heading"><h2 id="pricing-plans">{c.plansHeading}</h2><p>{c.plansIntro}</p></div>
      <div className="pricing-cards">{plans.map(plan => <article className={`pricing-card${plan.free ? ' pricing-card-free' : ''}`} key={plan.name}>
        <div className="pricing-card-top"><h3>{plan.name}</h3><span className={`pricing-status${plan.free ? ' pricing-status-live' : ''}`}>{plan.status}</span></div>
        <p className="pricing-card-description">{plan.description}</p>
        <ul className="pricing-feature-list">{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
        {plan.free ? <StoreCta label={c.install} /> : <p className="pricing-pending">{c.pending}</p>}
      </article>)}</div>
    </div></section>

    <section className="section section-soft" aria-labelledby="pricing-compare"><div className="wrap">
      <div className="section-heading"><h2 id="pricing-compare">{c.compareHeading}</h2></div>
      <div className="pricing-table-scroll" tabIndex={0} role="region" aria-label={c.compareHeading}>
        <table className="pricing-table"><thead><tr><th scope="col">{c.feature}</th><th scope="col">{c.freeName}</th><th scope="col">{c.dayName}<span>{c.soon}</span></th><th scope="col">{c.weekName}<span>{c.soon}</span></th></tr></thead>
          <tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.free}</td><td>{row.paid}</td><td>{row.paid}</td></tr>)}</tbody>
        </table>
      </div><p className="pricing-table-note">{c.comparisonNote}</p>
    </div></section>

    <section className="section" aria-labelledby="pricing-how"><div className="wrap"><div className="section-heading"><h2 id="pricing-how">{c.howHeading}</h2></div>
      <ol className="pricing-steps">{c.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol>
    </div></section>

    <section className="section section-soft" aria-labelledby="pricing-faq"><div className="wrap"><div className="section-heading"><h2 id="pricing-faq">{c.faqHeading}</h2></div>
      <div className="pricing-faq">{c.faq.map(([question, answer]) => <article className="card" key={question}><h3>{question}</h3><p>{answer}</p></article>)}</div>
    </div></section>

    <section className="section final-cta"><div className="wrap"><div className="band"><div><h2>{c.finalHeading}</h2><p>{c.finalBody}</p></div><StoreCta label={c.install} /></div>
      <nav className="pricing-related" aria-label={c.featuresLink}><Link href={localizedPath(locale, 'features')}>{c.featuresLink}</Link><Link href={localizedPath(locale, 'privacy')}>{c.privacyLink}</Link><Link href={localizedPath(locale, 'terms')}>{c.termsLink}</Link></nav>
    </div></section>
  </main>;
}
