'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { GA_MEASUREMENT_ID, initializeAcceptedAnalytics, initializeGoogleTag, revokeAnalytics } from '@/lib/analytics';
import { restoreAnalyticsConsent, saveAnalyticsConsent, type AnalyticsConsent } from '@/lib/analytics-consent';
import { localizedPath, type Locale } from '@/lib/site';

type Copy = { title: string; description: string; accept: string; reject: string; settings: string; manage: string; current: string; accepted: string; rejected: string; unset: string; privacy: string; close: string };
const copy: Record<Locale, Copy> = {
  en: { title: 'Analytics choices', description: 'With your permission, Google Analytics and Mixpanel help us understand visits and installation link clicks. Your choice does not affect the website or extension download.', accept: 'Accept analytics', reject: 'Reject analytics', settings: 'Settings', manage: 'Analytics settings', current: 'Current choice:', accepted: 'Accepted', rejected: 'Rejected', unset: 'Not chosen', privacy: 'Privacy policy', close: 'Close settings' },
  'zh-CN': { title: '统计设置', description: '经你同意后，Google Analytics 和 Mixpanel 会帮助我们了解访问和安装链接点击。你的选择不影响网站或扩展下载。', accept: '接受统计', reject: '拒绝统计', settings: '设置', manage: '统计设置', current: '当前选择：', accepted: '已接受', rejected: '已拒绝', unset: '未选择', privacy: '隐私说明', close: '关闭设置' },
  'zh-TW': { title: '分析設定', description: '經你同意後，Google Analytics 與 Mixpanel 會協助我們了解瀏覽和安裝連結點擊。你的選擇不影響網站或擴充功能下載。', accept: '接受分析', reject: '拒絕分析', settings: '設定', manage: '分析設定', current: '目前選擇：', accepted: '已接受', rejected: '已拒絕', unset: '未選擇', privacy: '隱私權說明', close: '關閉設定' },
  ja: { title: 'アクセス解析の設定', description: '同意いただいた場合、Google Analytics と Mixpanel で訪問とインストールリンクのクリックを測定します。選択によってサイトや拡張機能のダウンロードは制限されません。', accept: '解析を許可', reject: '解析を拒否', settings: '設定', manage: '解析の設定', current: '現在の選択:', accepted: '許可済み', rejected: '拒否済み', unset: '未選択', privacy: 'プライバシー', close: '設定を閉じる' },
  ko: { title: '분석 설정', description: '동의하면 Google Analytics와 Mixpanel이 방문 및 설치 링크 클릭을 측정합니다. 선택과 관계없이 웹사이트와 확장 프로그램 다운로드를 이용할 수 있습니다.', accept: '분석 허용', reject: '분석 거부', settings: '설정', manage: '분석 설정', current: '현재 선택:', accepted: '허용함', rejected: '거부함', unset: '선택 안 함', privacy: '개인정보 보호', close: '설정 닫기' },
  de: { title: 'Analyse-Einstellungen', description: 'Mit deiner Zustimmung messen Google Analytics und Mixpanel Besuche und Klicks auf den Installationslink. Deine Wahl schränkt die Website oder den Download nicht ein.', accept: 'Analyse akzeptieren', reject: 'Analyse ablehnen', settings: 'Einstellungen', manage: 'Analyse-Einstellungen', current: 'Aktuelle Auswahl:', accepted: 'Akzeptiert', rejected: 'Abgelehnt', unset: 'Nicht ausgewählt', privacy: 'Datenschutz', close: 'Einstellungen schließen' },
  fr: { title: 'Paramètres de mesure', description: 'Avec votre accord, Google Analytics et Mixpanel mesurent les visites et les clics sur le lien d’installation. Votre choix ne limite pas l’accès au site ni au téléchargement.', accept: 'Accepter la mesure', reject: 'Refuser la mesure', settings: 'Paramètres', manage: 'Paramètres de mesure', current: 'Choix actuel :', accepted: 'Accepté', rejected: 'Refusé', unset: 'Aucun choix', privacy: 'Confidentialité', close: 'Fermer les paramètres' },
  es: { title: 'Opciones de análisis', description: 'Con tu permiso, Google Analytics y Mixpanel miden las visitas y los clics en el enlace de instalación. Tu elección no limita el sitio ni la descarga.', accept: 'Aceptar análisis', reject: 'Rechazar análisis', settings: 'Configuración', manage: 'Opciones de análisis', current: 'Elección actual:', accepted: 'Aceptado', rejected: 'Rechazado', unset: 'Sin elegir', privacy: 'Privacidad', close: 'Cerrar opciones' },
  'pt-BR': { title: 'Preferências de análise', description: 'Com sua permissão, Google Analytics e Mixpanel medem visitas e cliques no link de instalação. Sua escolha não limita o site nem o download.', accept: 'Aceitar análise', reject: 'Recusar análise', settings: 'Configurações', manage: 'Preferências de análise', current: 'Escolha atual:', accepted: 'Aceita', rejected: 'Recusada', unset: 'Não escolhida', privacy: 'Privacidade', close: 'Fechar configurações' },
};

export function AnalyticsConsentManager({ locale, onConsentChange }: { locale: Locale; onConsentChange: (status: AnalyticsConsent) => void }) {
  const [consent, setConsent] = useState<AnalyticsConsent>('unset');
  const [hydrated, setHydrated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const c = copy[locale];

  useEffect(() => {
    const saved = restoreAnalyticsConsent();
    if (saved === 'accepted') initializeAcceptedAnalytics();
    setConsent(saved);
    onConsentChange(saved);
    setHydrated(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'seo_copilot_analytics_consent') return;
      const updated = restoreAnalyticsConsent();
      if (updated === 'accepted') initializeAcceptedAnalytics();
      else revokeAnalytics();
      setConsent(updated);
      onConsentChange(updated);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [onConsentChange]);

  useEffect(() => {
    const open = () => setSettingsOpen(true);
    window.addEventListener('seo-copilot:analytics-settings', open);
    return () => window.removeEventListener('seo-copilot:analytics-settings', open);
  }, []);

  function choose(choice: Exclude<AnalyticsConsent, 'unset'>) {
    saveAnalyticsConsent(choice);
    if (choice === 'accepted') initializeAcceptedAnalytics();
    else revokeAnalytics();
    setConsent(choice);
    onConsentChange(choice);
    setSettingsOpen(false);
  }

  if (!hydrated) return null;
  return <>
    {consent === 'accepted' && <Script id="seo-copilot-ga4" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" onReady={initializeGoogleTag} />}
    {(consent === 'unset' || settingsOpen) && <section className="analytics-consent" aria-label={c.title}>
      <div className="analytics-consent-inner">
        <div><h2>{c.title}</h2><p>{c.description}</p>{settingsOpen && <p className="analytics-consent-status">{c.current} {c[consent]}</p>}<Link href={localizedPath(locale, 'privacy')}>{c.privacy}</Link></div>
        <div className="analytics-consent-actions">
          <button type="button" onClick={() => choose('accepted')}>{c.accept}</button>
          <button type="button" onClick={() => choose('rejected')}>{c.reject}</button>
          {consent === 'unset' && !settingsOpen && <button type="button" onClick={() => setSettingsOpen(true)}>{c.settings}</button>}
          {settingsOpen && <button type="button" onClick={() => setSettingsOpen(false)}>{c.close}</button>}
        </div>
      </div>
    </section>}
    {consent !== 'unset' && !settingsOpen && <button className="analytics-settings-tab" type="button" onClick={() => setSettingsOpen(true)}>{c.settings}</button>}
  </>;
}

export function PrivacySettingsButton({ locale }: { locale: Locale }) {
  return <button className="privacy-settings-button" type="button" onClick={() => window.dispatchEvent(new Event('seo-copilot:analytics-settings'))}>{copy[locale].manage}</button>;
}
