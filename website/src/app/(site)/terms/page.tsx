import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for SEO Copilot.',
};

export default function TermsPage() {
  return <main className="page"><div className="wrap prose"><p className="eyebrow">Terms of Use</p><h1>Terms of Use</h1><p>By using SEO Copilot, you agree to these basic terms of use.</p><h2>Acceptable use</h2><p>Use the extension lawfully and do not interfere with the service, abuse request limits, or attempt unauthorized access.</p><h2>Service limits</h2><p>SEO Copilot provides page-level SEO guidance and does not guarantee rankings, traffic, or any particular outcome. You are responsible for reviewing suggestions before using them.</p><h2>Contact</h2><p><a href="https://github.com/sumei7550/SEO-Copilot/issues" target="_blank" rel="noopener noreferrer">GitHub support</a></p></div></main>;
}
