import { useEffect, useRef, useState } from 'react';
import { trackExtension } from '../analytics';
import { recordOnboardingSeenAt } from '../onboarding/activation';
import { closeWelcomeTab } from './navigation';

export function Welcome() {
  const viewed = useRef(false);
  const [closeError, setCloseError] = useState(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    trackExtension('ext_onboarding_viewed');
    void recordOnboardingSeenAt().catch((error) => {
      console.error('SEO Copilot: failed to record onboarding view', error);
    });
  }, []);

  const start = async () => {
    try {
      await recordOnboardingSeenAt();
    } catch (error) {
      console.error('SEO Copilot: failed to record onboarding view', error);
    }
    try {
      await closeWelcomeTab();
    } catch (error) {
      console.error('SEO Copilot: failed to close welcome tab', error);
      setCloseError(true);
    }
  };

  return <main className="welcome-shell">
    <header className="welcome-brand">
      <img src="/icons/icon48.png" width="40" height="40" alt="" />
      <span>SEO Copilot</span>
    </header>

    <section className="welcome-content" aria-labelledby="welcome-title">
      <p className="welcome-eyebrow">Your first page audit</p>
      <h1 id="welcome-title">Welcome to SEO Copilot</h1>
      <p className="welcome-intro">Get your first SEO report in three steps:</p>

      <ol className="welcome-steps">
        <li><span className="welcome-step-number" aria-hidden="true">1</span><span>Open any regular webpage.</span></li>
        <li><span className="welcome-step-number" aria-hidden="true">2</span><span>Click SEO Copilot in your Chrome toolbar.</span></li>
        <li><span className="welcome-step-number" aria-hidden="true">3</span><span>In the Side Panel, click <strong>Scan current page</strong>.</span></li>
      </ol>

      <p className="welcome-permission">If Chrome asks for access to that site, choose <strong>Allow</strong> to continue.</p>
      <button className="welcome-cta" type="button" onClick={() => void start()}>Start using SEO Copilot <span aria-hidden="true">→</span></button>
      {closeError ? <p className="welcome-error" role="alert">Close this tab, open any webpage, then click SEO Copilot in your toolbar.</p> : null}
      <p className="welcome-tip">Tip: You can pin SEO Copilot for quicker access, but you don’t need to.</p>
    </section>
  </main>;
}
