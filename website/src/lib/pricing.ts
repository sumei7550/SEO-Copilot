import type { Locale } from './site';

export type PricingCopy = {
  nav: string; title: string; description: string; eyebrow: string; hero: string; intro: string;
  available: string; soon: string; plansHeading: string; plansIntro: string;
  freeName: string; freeDescription: string; freeFeatures: string[];
  dayName: string; dayDescription: string; weekName: string; weekDescription: string;
  paidFeatures: string[]; pending: string; install: string;
  compareHeading: string; feature: string; comparison: string[]; included: string;
  limited: string; currentLimits: string; planned: string; plannedLimits: string; notApplicable: string; toConfirm: string; comparisonNote: string;
  howHeading: string; steps: string[]; faqHeading: string; faq: [string, string][];
  finalHeading: string; finalBody: string; featuresLink: string; privacyLink: string; termsLink: string;
};

const commonFeatures = [
  'Basic SEO scan', 'SEO score and issue report', 'Recommended actions', 'Re-scan',
  'AI title suggestions', 'AI meta description suggestions', 'Generate another', 'Paid access duration',
];

export const pricingCopy: Record<Locale, PricingCopy> = {
  en: {
    nav: 'Pricing', title: 'Plans for Focused Page Checks', description: 'Explore free SEO page checks and planned short-term access to AI title and meta description suggestions. Paid passes are not available yet.',
    eyebrow: 'Plans', hero: 'SEO Copilot plans for focused page checks', intro: "Scan the page you're viewing for free. Short-term access to more AI title and meta description suggestions is being planned.",
    available: 'Available', soon: 'Coming soon', plansHeading: 'Start free. See what is planned.', plansIntro: 'The free page check is available now. Short-term AI passes are still in development.',
    freeName: 'Free', freeDescription: "Everything you need to check a page's basic SEO.", freeFeatures: ['Scan the current page', 'SEO score and issue report', 'Issue severity and recommended actions', 'Re-scan after changes'],
    dayName: '1-Day Pass', dayDescription: 'Planned for focused SEO work on a page or a small set of pages.', weekName: '7-Day Pass', weekDescription: 'Planned for a week of iterative page optimization.',
    paidFeatures: ['AI title suggestions for supported issues', 'AI meta description suggestions for supported issues', 'Generate another within the applicable usage limits'], pending: 'Price, AI usage limits, and availability are being finalized.', install: 'Install on Chrome',
    compareHeading: 'Compare what is available and planned', feature: 'Feature', comparison: commonFeatures, included: 'Included', limited: 'Limited free access under current service rules', currentLimits: 'Subject to current service limits', planned: 'Planned', plannedLimits: 'Planned limits', notApplicable: 'Not applicable', toConfirm: 'To be confirmed', comparisonNote: 'The paid columns describe plans, not passes available to purchase.',
    howHeading: 'How it works', steps: ["Scan the page you're viewing.", 'Review your SEO score and issues.', 'Review and copy AI suggestions when available.', 'Make changes yourself and re-scan.'],
    faqHeading: 'Frequently asked questions', faq: [
      ['What can I do with the free plan?', 'Scan the current page, review its SEO score and issues, follow recommended actions, and re-scan after making changes.'],
      ['Does SEO Copilot automatically change my website?', 'No. You review and copy a suggestion, make the change yourself, and re-scan the page.'],
      ['Which issues support AI suggestions?', 'AI suggestions currently support selected Title and Meta Description issues. Not every SEO issue supports AI suggestions.'],
      ['How are AI suggestions counted?', 'One AI request may return multiple candidate suggestions. Generate another makes another request. Final paid usage limits are still being defined.'],
      ['Can I buy a pass now?', 'Not yet. Short-term AI passes are being planned. You can use the currently available extension while paid access is being developed.'],
      ['What happens when a pass expires?', 'Expiry behavior and final paid-access rules are still being finalized. No paid pass is available to purchase yet.'],
    ],
    finalHeading: 'Start with a free SEO check', finalBody: 'Scan a page, understand its SEO issues, and decide what to improve next.', featuresLink: 'Explore features', privacyLink: 'Privacy', termsLink: 'Terms',
  },
  'zh-CN': {
    nav: '价格方案', title: '页面 SEO 检查方案', description: '了解 SEO Copilot 当前免费的页面检查，以及筹备中的短期 AI 标题与 Meta 描述建议方案。付费通行证尚未开放。',
    eyebrow: '方案', hero: '专注当前页面的 SEO Copilot 方案', intro: '免费检查你正在浏览的页面。我们正在规划短期使用更多 AI 标题和 Meta 描述建议的方案。',
    available: '现已可用', soon: '即将推出', plansHeading: '从免费检查开始，了解后续计划', plansIntro: '免费页面检查现已可用；短期 AI 通行证仍在开发中。',
    freeName: '免费', freeDescription: '检查页面基础 SEO 所需的核心功能。', freeFeatures: ['扫描当前页面', 'SEO 评分与问题报告', '问题严重程度与建议操作', '修改后重新扫描'],
    dayName: '1 日通行证', dayDescription: '计划面向单个或少量页面的短期 SEO 优化任务。', weekName: '7 日通行证', weekDescription: '计划面向一周内持续优化多个页面的工作。',
    paidFeatures: ['针对受支持问题的 AI 标题建议', '针对受支持问题的 AI Meta 描述建议', '在适用额度内再次生成'], pending: '价格、AI 使用额度及开放时间仍在确定中。', install: '安装到 Chrome',
    compareHeading: '对比现有功能与筹备方案', feature: '功能', comparison: ['基础 SEO 扫描', 'SEO 评分与问题报告', '建议操作', '重新扫描', 'AI 标题建议', 'AI Meta 描述建议', '再次生成', '付费使用期限'], included: '包含', limited: '按当前服务规则提供有限免费使用', currentLimits: '受当前服务限额约束', planned: '计划提供', plannedLimits: '额度待定', notApplicable: '不适用', toConfirm: '待确定', comparisonNote: '付费栏仅说明产品计划，通行证目前无法购买。',
    howHeading: '使用方式', steps: ['扫描你正在浏览的页面。', '查看 SEO 评分与问题。', '可用时审阅并复制 AI 建议。', '手动修改页面，然后重新扫描。'],
    faqHeading: '常见问题', faq: [
      ['免费方案能做什么？', '可以扫描当前页面、查看 SEO 评分和问题、参考建议操作，并在修改后重新扫描。'],
      ['SEO Copilot 会自动修改网站吗？', '不会。你需要审阅并复制建议，自己修改页面，再重新扫描。'],
      ['哪些问题支持 AI 建议？', '目前仅部分标题和 Meta 描述问题支持 AI 建议，并非所有 SEO 问题都支持。'],
      ['AI 建议如何计数？', '一次 AI 请求可能返回多个候选建议；“再次生成”会发起新请求。最终付费额度仍在制定。'],
      ['现在可以购买通行证吗？', '还不能。短期 AI 通行证正在规划中；你现在可以使用已开放的扩展功能。'],
      ['通行证到期后会怎样？', '到期后的具体规则仍在确定中。目前没有可购买的付费通行证。'],
    ],
    finalHeading: '从免费的 SEO 检查开始', finalBody: '扫描一个页面，了解它的 SEO 问题，再决定下一步改进什么。', featuresLink: '查看功能', privacyLink: '隐私说明', termsLink: '使用条款',
  },
  'zh-TW': {
    nav: '價格方案', title: '頁面 SEO 檢查方案', description: '了解 SEO Copilot 現有的免費頁面檢查，以及規劃中的短期 AI 標題與 Meta 描述建議方案。付費通行證尚未開放。',
    eyebrow: '方案', hero: '專注目前頁面的 SEO Copilot 方案', intro: '免費檢查你正在瀏覽的頁面。我們正在規劃短期使用更多 AI 標題與 Meta 描述建議的方案。',
    available: '現已提供', soon: '即將推出', plansHeading: '從免費檢查開始，了解後續計畫', plansIntro: '免費頁面檢查現已提供；短期 AI 通行證仍在開發中。',
    freeName: '免費', freeDescription: '檢查頁面基本 SEO 所需的核心功能。', freeFeatures: ['掃描目前頁面', 'SEO 評分與問題報告', '問題嚴重程度與建議操作', '修改後重新掃描'],
    dayName: '1 日通行證', dayDescription: '規劃供單一或少量頁面的短期 SEO 優化工作使用。', weekName: '7 日通行證', weekDescription: '規劃供一週內持續優化多個頁面使用。',
    paidFeatures: ['針對支援問題的 AI 標題建議', '針對支援問題的 AI Meta 描述建議', '在適用額度內再次產生'], pending: '價格、AI 使用額度與開放時間仍在確認中。', install: '安裝到 Chrome',
    compareHeading: '比較現有功能與規劃方案', feature: '功能', comparison: ['基本 SEO 掃描', 'SEO 評分與問題報告', '建議操作', '重新掃描', 'AI 標題建議', 'AI Meta 描述建議', '再次產生', '付費使用期限'], included: '包含', limited: '依目前服務規則提供有限免費使用', currentLimits: '受目前服務限制約束', planned: '規劃中', plannedLimits: '額度待確認', notApplicable: '不適用', toConfirm: '待確認', comparisonNote: '付費欄位僅說明產品計畫，目前無法購買通行證。',
    howHeading: '使用方式', steps: ['掃描你正在瀏覽的頁面。', '查看 SEO 評分與問題。', '可用時檢視並複製 AI 建議。', '自行修改頁面，再重新掃描。'],
    faqHeading: '常見問題', faq: [
      ['免費方案可以做什麼？', '你可以掃描目前頁面、查看 SEO 評分和問題、參考建議操作，並在修改後重新掃描。'],
      ['SEO Copilot 會自動修改網站嗎？', '不會。你需要檢視並複製建議，自行修改頁面，再重新掃描。'],
      ['哪些問題支援 AI 建議？', '目前只有部分標題和 Meta 描述問題支援 AI 建議，並非所有 SEO 問題都支援。'],
      ['AI 建議如何計算次數？', '一次 AI 請求可能回傳多個候選建議；「再次產生」會發出新請求。最終付費額度仍在制定。'],
      ['現在可以購買通行證嗎？', '還不能。短期 AI 通行證仍在規劃中；你現在可以使用已開放的擴充功能。'],
      ['通行證到期後會怎樣？', '到期後的具體規則仍在確認中。目前沒有可購買的付費通行證。'],
    ],
    finalHeading: '從免費 SEO 檢查開始', finalBody: '掃描一個頁面，了解它的 SEO 問題，再決定下一步要改善什麼。', featuresLink: '查看功能', privacyLink: '隱私權說明', termsLink: '使用條款',
  },
  ja: {
    nav: '料金プラン', title: 'ページ SEO チェックのプラン', description: 'SEO Copilot の無料ページチェックと、計画中の短期 AI タイトル・メタディスクリプション提案プランをご案内します。有料パスはまだ購入できません。',
    eyebrow: 'プラン', hero: '開いているページを確認する SEO Copilot のプラン', intro: '閲覧中のページを無料でチェックできます。タイトルとメタディスクリプションの AI 提案をさらに利用できる短期プランを計画しています。',
    available: '利用可能', soon: '近日公開', plansHeading: 'まずは無料で。今後のプランもご紹介', plansIntro: '無料のページチェックは現在利用できます。短期 AI パスは開発中です。',
    freeName: '無料', freeDescription: 'ページの基本的な SEO を確認するための機能です。', freeFeatures: ['現在のページをスキャン', 'SEO スコアと問題レポート', '問題の重大度と推奨アクション', '変更後の再スキャン'],
    dayName: '1 日パス', dayDescription: '1 ページまたは少数のページを短期間で最適化する作業向けに計画中です。', weekName: '7 日パス', weekDescription: '1 週間にわたり複数ページを繰り返し改善する作業向けに計画中です。',
    paidFeatures: ['対応する問題の AI タイトル提案', '対応する問題の AI メタディスクリプション提案', '適用される利用上限内で再生成'], pending: '価格、AI の利用上限、提供開始時期は調整中です。', install: 'Chrome に追加',
    compareHeading: '現在の機能と計画中の機能を比較', feature: '機能', comparison: ['基本 SEO スキャン', 'SEO スコアと問題レポート', '推奨アクション', '再スキャン', 'AI タイトル提案', 'AI メタディスクリプション提案', '再生成', '有料利用期間'], included: '含まれる', limited: '現在のサービス規則に基づく限定的な無料利用', currentLimits: '現在のサービス上限が適用', planned: '計画中', plannedLimits: '上限は未定', notApplicable: '対象外', toConfirm: '未定', comparisonNote: '有料プランの列は今後の計画です。現在パスは購入できません。',
    howHeading: '使い方', steps: ['閲覧中のページをスキャンします。', 'SEO スコアと問題を確認します。', '利用できる場合は AI 提案を確認してコピーします。', '自分で変更を加え、再スキャンします。'],
    faqHeading: 'よくある質問', faq: [
      ['無料プランでは何ができますか？', '現在のページをスキャンし、SEO スコアと問題、推奨アクションを確認できます。変更後の再スキャンも可能です。'],
      ['SEO Copilot はサイトを自動で変更しますか？', 'いいえ。提案を確認してコピーし、変更はご自身で行ってから再スキャンしてください。'],
      ['どの問題で AI 提案を利用できますか？', '現在は一部のタイトルとメタディスクリプションの問題に対応しています。すべての SEO 問題には対応していません。'],
      ['AI 提案はどのようにカウントされますか？', '1 回の AI リクエストで複数の候補が返る場合があります。「再生成」は新たなリクエストです。有料プランの上限は未定です。'],
      ['今すぐパスを購入できますか？', 'まだ購入できません。短期 AI パスを計画中です。現在利用可能な拡張機能はお使いいただけます。'],
      ['パスの期限が切れるとどうなりますか？', '期限後の動作と有料利用の最終規則は調整中です。現在、購入できる有料パスはありません。'],
    ],
    finalHeading: '無料の SEO チェックから始めましょう', finalBody: 'ページをスキャンし、SEO の問題を理解して、次に改善する点を決めましょう。', featuresLink: '機能を見る', privacyLink: 'プライバシー', termsLink: '利用規約',
  },
  ko: {
    nav: '요금제', title: '페이지 SEO 검사 요금제', description: 'SEO Copilot의 무료 페이지 검사와 준비 중인 단기 AI 제목 및 메타 설명 제안 요금제를 확인하세요. 유료 패스는 아직 구매할 수 없습니다.',
    eyebrow: '요금제', hero: '현재 페이지 검사에 집중하는 SEO Copilot 요금제', intro: '현재 보고 있는 페이지를 무료로 검사하세요. AI 제목 및 메타 설명 제안을 더 이용할 수 있는 단기 요금제를 준비하고 있습니다.',
    available: '이용 가능', soon: '출시 예정', plansHeading: '무료로 시작하고 예정된 요금제를 살펴보세요', plansIntro: '무료 페이지 검사는 지금 이용할 수 있습니다. 단기 AI 패스는 개발 중입니다.',
    freeName: '무료', freeDescription: '페이지의 기본 SEO를 확인하는 데 필요한 기능입니다.', freeFeatures: ['현재 페이지 스캔', 'SEO 점수 및 문제 보고서', '문제 심각도 및 권장 조치', '변경 후 다시 스캔'],
    dayName: '1일 패스', dayDescription: '한 페이지 또는 소수의 페이지를 단기간에 최적화하는 작업을 위해 계획 중입니다.', weekName: '7일 패스', weekDescription: '일주일 동안 여러 페이지를 반복해서 개선하는 작업을 위해 계획 중입니다.',
    paidFeatures: ['지원되는 문제의 AI 제목 제안', '지원되는 문제의 AI 메타 설명 제안', '적용되는 사용 한도 내에서 다시 생성'], pending: '가격, AI 사용 한도 및 제공 일정은 아직 확정되지 않았습니다.', install: 'Chrome에 설치',
    compareHeading: '현재 기능과 예정된 기능 비교', feature: '기능', comparison: ['기본 SEO 스캔', 'SEO 점수 및 문제 보고서', '권장 조치', '다시 스캔', 'AI 제목 제안', 'AI 메타 설명 제안', '다시 생성', '유료 이용 기간'], included: '포함', limited: '현재 서비스 규칙에 따른 제한적 무료 이용', currentLimits: '현재 서비스 한도 적용', planned: '계획 중', plannedLimits: '한도 미정', notApplicable: '해당 없음', toConfirm: '미정', comparisonNote: '유료 요금제 열은 향후 계획을 설명합니다. 현재 패스를 구매할 수 없습니다.',
    howHeading: '이용 방법', steps: ['현재 보고 있는 페이지를 스캔합니다.', 'SEO 점수와 문제를 확인합니다.', '가능할 때 AI 제안을 검토하고 복사합니다.', '직접 변경한 뒤 다시 스캔합니다.'],
    faqHeading: '자주 묻는 질문', faq: [
      ['무료 요금제로 무엇을 할 수 있나요?', '현재 페이지를 스캔하고 SEO 점수와 문제, 권장 조치를 확인한 뒤 변경 후 다시 스캔할 수 있습니다.'],
      ['SEO Copilot이 웹사이트를 자동으로 변경하나요?', '아니요. 제안을 검토하고 복사한 다음 직접 변경하고 페이지를 다시 스캔해야 합니다.'],
      ['어떤 문제에 AI 제안이 제공되나요?', '현재 일부 제목 및 메타 설명 문제만 지원합니다. 모든 SEO 문제에 AI 제안이 제공되지는 않습니다.'],
      ['AI 제안은 어떻게 계산되나요?', '한 번의 AI 요청에서 여러 후보가 나올 수 있습니다. 다시 생성하면 새 요청이 발생합니다. 최종 유료 사용 한도는 아직 정해지지 않았습니다.'],
      ['지금 패스를 구매할 수 있나요?', '아직 구매할 수 없습니다. 단기 AI 패스를 준비 중이며 현재 제공되는 확장 프로그램은 이용할 수 있습니다.'],
      ['패스가 만료되면 어떻게 되나요?', '만료 후 동작과 최종 유료 이용 규칙은 아직 확정되지 않았습니다. 현재 구매 가능한 유료 패스는 없습니다.'],
    ],
    finalHeading: '무료 SEO 검사로 시작하세요', finalBody: '페이지를 스캔하고 SEO 문제를 이해한 뒤 다음 개선 사항을 결정하세요.', featuresLink: '기능 살펴보기', privacyLink: '개인정보 보호', termsLink: '이용 약관',
  },
  de: {
    nav: 'Preise', title: 'Pläne für gezielte Seitenprüfungen', description: 'Entdecke kostenlose SEO-Seitenprüfungen und geplante Kurzzeitpässe für KI-Vorschläge zu Titeln und Meta-Descriptions. Bezahlte Pässe sind noch nicht erhältlich.',
    eyebrow: 'Pläne', hero: 'SEO Copilot Pläne für gezielte Seitenprüfungen', intro: 'Prüfe die geöffnete Seite kostenlos. Ein zeitlich begrenzter Zugang zu weiteren KI-Vorschlägen für Titel und Meta-Descriptions ist in Planung.',
    available: 'Verfügbar', soon: 'Demnächst', plansHeading: 'Kostenlos starten und geplante Pässe ansehen', plansIntro: 'Die kostenlose Seitenprüfung ist verfügbar. Kurzzeitpässe für KI-Funktionen befinden sich noch in Entwicklung.',
    freeName: 'Kostenlos', freeDescription: 'Alles Wichtige für die grundlegende SEO-Prüfung einer Seite.', freeFeatures: ['Aktuelle Seite prüfen', 'SEO-Score und Problembericht', 'Schweregrad und empfohlene Schritte', 'Nach Änderungen erneut prüfen'],
    dayName: '1-Tages-Pass', dayDescription: 'Geplant für gezielte SEO-Arbeiten an einer oder wenigen Seiten.', weekName: '7-Tage-Pass', weekDescription: 'Geplant für die wiederholte Optimierung mehrerer Seiten innerhalb einer Woche.',
    paidFeatures: ['KI-Titelvorschläge für unterstützte Probleme', 'KI-Meta-Description-Vorschläge für unterstützte Probleme', 'Erneut generieren innerhalb der geltenden Nutzungslimits'], pending: 'Preis, KI-Nutzungslimits und Verfügbarkeit werden noch festgelegt.', install: 'In Chrome installieren',
    compareHeading: 'Verfügbare und geplante Funktionen vergleichen', feature: 'Funktion', comparison: ['Grundlegende SEO-Prüfung', 'SEO-Score und Problembericht', 'Empfohlene Schritte', 'Erneute Prüfung', 'KI-Titelvorschläge', 'KI-Meta-Description-Vorschläge', 'Erneut generieren', 'Dauer des bezahlten Zugangs'], included: 'Enthalten', limited: 'Begrenzter kostenloser Zugang nach aktuellen Dienstregeln', currentLimits: 'Aktuelle Dienstlimits gelten', planned: 'Geplant', plannedLimits: 'Limits in Planung', notApplicable: 'Nicht zutreffend', toConfirm: 'Noch offen', comparisonNote: 'Die Spalten für bezahlte Pässe beschreiben Pläne; Pässe können noch nicht gekauft werden.',
    howHeading: 'So funktioniert es', steps: ['Prüfe die geöffnete Seite.', 'Sieh dir SEO-Score und Probleme an.', 'Prüfe und kopiere KI-Vorschläge, wenn verfügbar.', 'Ändere die Seite selbst und prüfe sie erneut.'],
    faqHeading: 'Häufige Fragen', faq: [
      ['Was bietet der kostenlose Plan?', 'Du kannst die aktuelle Seite prüfen, SEO-Score und Probleme ansehen, empfohlenen Schritten folgen und nach Änderungen erneut prüfen.'],
      ['Ändert SEO Copilot meine Website automatisch?', 'Nein. Du prüfst und kopierst einen Vorschlag, nimmst die Änderung selbst vor und prüfst die Seite erneut.'],
      ['Für welche Probleme gibt es KI-Vorschläge?', 'Derzeit werden ausgewählte Probleme bei Titeln und Meta-Descriptions unterstützt. Nicht für jedes SEO-Problem gibt es KI-Vorschläge.'],
      ['Wie werden KI-Vorschläge gezählt?', 'Eine KI-Anfrage kann mehrere Vorschläge liefern. „Erneut generieren“ startet eine weitere Anfrage. Die endgültigen Limits für bezahlte Pässe stehen noch nicht fest.'],
      ['Kann ich jetzt einen Pass kaufen?', 'Noch nicht. Kurzzeitpässe sind in Planung. Die bereits verfügbare Erweiterung kannst du jetzt nutzen.'],
      ['Was passiert nach Ablauf eines Passes?', 'Das Verhalten nach Ablauf und die endgültigen Zugangsregeln werden noch festgelegt. Derzeit ist kein bezahlter Pass erhältlich.'],
    ],
    finalHeading: 'Starte mit einer kostenlosen SEO-Prüfung', finalBody: 'Prüfe eine Seite, verstehe ihre SEO-Probleme und entscheide über die nächste Verbesserung.', featuresLink: 'Funktionen ansehen', privacyLink: 'Datenschutz', termsLink: 'Nutzungsbedingungen',
  },
  fr: {
    nav: 'Tarifs', title: 'Offres pour analyser une page', description: 'Découvrez l’analyse SEO gratuite de SEO Copilot et les accès courts envisagés pour les suggestions IA de titres et de méta-descriptions. Les pass payants ne sont pas encore disponibles.',
    eyebrow: 'Offres', hero: 'Des offres SEO Copilot pour analyser une page à la fois', intro: 'Analysez gratuitement la page que vous consultez. Un accès de courte durée à davantage de suggestions IA de titres et de méta-descriptions est en préparation.',
    available: 'Disponible', soon: 'Bientôt disponible', plansHeading: 'Commencez gratuitement, découvrez la suite', plansIntro: 'L’analyse gratuite est disponible. Les pass IA de courte durée sont encore en développement.',
    freeName: 'Gratuit', freeDescription: 'Les fonctions essentielles pour vérifier le SEO d’une page.', freeFeatures: ['Analyser la page ouverte', 'Score SEO et rapport de problèmes', 'Gravité et actions recommandées', 'Relancer l’analyse après modification'],
    dayName: 'Pass 1 jour', dayDescription: 'Prévu pour un travail SEO ciblé sur une page ou quelques pages.', weekName: 'Pass 7 jours', weekDescription: 'Prévu pour améliorer plusieurs pages au fil d’une semaine.',
    paidFeatures: ['Suggestions IA de titres pour les problèmes pris en charge', 'Suggestions IA de méta-descriptions pour les problèmes pris en charge', 'Générer à nouveau dans les limites applicables'], pending: 'Le prix, les limites d’utilisation de l’IA et la disponibilité restent à définir.', install: 'Installer sur Chrome',
    compareHeading: 'Comparer les fonctions disponibles et prévues', feature: 'Fonction', comparison: ['Analyse SEO de base', 'Score SEO et rapport de problèmes', 'Actions recommandées', 'Relancer l’analyse', 'Suggestions IA de titres', 'Suggestions IA de méta-descriptions', 'Générer à nouveau', 'Durée de l’accès payant'], included: 'Inclus', limited: 'Accès gratuit limité selon les règles actuelles du service', currentLimits: 'Soumis aux limites actuelles du service', planned: 'Prévu', plannedLimits: 'Limites à définir', notApplicable: 'Sans objet', toConfirm: 'À confirmer', comparisonNote: 'Les colonnes des pass payants décrivent des projets ; aucun pass ne peut encore être acheté.',
    howHeading: 'Comment ça marche', steps: ['Analysez la page que vous consultez.', 'Examinez le score SEO et les problèmes.', 'Consultez et copiez les suggestions IA lorsqu’elles sont disponibles.', 'Modifiez la page vous-même, puis relancez l’analyse.'],
    faqHeading: 'Questions fréquentes', faq: [
      ['Que permet l’offre gratuite ?', 'Vous pouvez analyser la page ouverte, consulter son score SEO et ses problèmes, suivre les actions recommandées, puis relancer l’analyse après modification.'],
      ['SEO Copilot modifie-t-il automatiquement mon site ?', 'Non. Vous consultez et copiez une suggestion, effectuez la modification vous-même, puis relancez l’analyse.'],
      ['Quels problèmes bénéficient de suggestions IA ?', 'Actuellement, certains problèmes de titres et de méta-descriptions sont pris en charge. Tous les problèmes SEO ne le sont pas.'],
      ['Comment les suggestions IA sont-elles comptées ?', 'Une demande IA peut fournir plusieurs propositions. « Générer à nouveau » envoie une nouvelle demande. Les limites des futurs pass restent à définir.'],
      ['Puis-je acheter un pass maintenant ?', 'Pas encore. Les pass IA de courte durée sont en préparation. Vous pouvez utiliser les fonctions déjà disponibles de l’extension.'],
      ['Que se passe-t-il à l’expiration d’un pass ?', 'Les règles après expiration et les conditions définitives d’accès payant restent à définir. Aucun pass payant n’est encore en vente.'],
    ],
    finalHeading: 'Commencez par une analyse SEO gratuite', finalBody: 'Analysez une page, comprenez ses problèmes SEO et choisissez votre prochaine amélioration.', featuresLink: 'Voir les fonctionnalités', privacyLink: 'Confidentialité', termsLink: 'Conditions d’utilisation',
  },
  es: {
    nav: 'Planes', title: 'Planes para revisar el SEO de una página', description: 'Descubre la revisión SEO gratuita de SEO Copilot y los pases breves previstos para sugerencias de títulos y meta descripciones con IA. Los pases de pago aún no están disponibles.',
    eyebrow: 'Planes', hero: 'Planes de SEO Copilot para revisar cada página', intro: 'Revisa gratis la página que estás viendo. Estamos preparando acceso temporal a más sugerencias de títulos y meta descripciones con IA.',
    available: 'Disponible', soon: 'Próximamente', plansHeading: 'Empieza gratis y conoce los planes previstos', plansIntro: 'La revisión gratuita de páginas ya está disponible. Los pases breves de IA siguen en desarrollo.',
    freeName: 'Gratis', freeDescription: 'Lo esencial para revisar el SEO básico de una página.', freeFeatures: ['Analizar la página actual', 'Puntuación SEO e informe de problemas', 'Gravedad y acciones recomendadas', 'Volver a analizar tras los cambios'],
    dayName: 'Pase de 1 día', dayDescription: 'Previsto para tareas SEO puntuales en una o pocas páginas.', weekName: 'Pase de 7 días', weekDescription: 'Previsto para mejorar varias páginas de forma continua durante una semana.',
    paidFeatures: ['Sugerencias de títulos con IA para problemas admitidos', 'Sugerencias de meta descripciones con IA para problemas admitidos', 'Generar otra vez dentro de los límites aplicables'], pending: 'El precio, los límites de uso de IA y la disponibilidad aún se están definiendo.', install: 'Instalar en Chrome',
    compareHeading: 'Compara las funciones disponibles y previstas', feature: 'Función', comparison: ['Análisis SEO básico', 'Puntuación SEO e informe de problemas', 'Acciones recomendadas', 'Volver a analizar', 'Sugerencias de títulos con IA', 'Sugerencias de meta descripciones con IA', 'Generar otra vez', 'Duración del acceso de pago'], included: 'Incluido', limited: 'Acceso gratuito limitado según las reglas actuales del servicio', currentLimits: 'Sujeto a los límites actuales del servicio', planned: 'Previsto', plannedLimits: 'Límites pendientes', notApplicable: 'No corresponde', toConfirm: 'Por confirmar', comparisonNote: 'Las columnas de pago describen planes futuros; todavía no se pueden comprar pases.',
    howHeading: 'Cómo funciona', steps: ['Analiza la página que estás viendo.', 'Revisa la puntuación SEO y los problemas.', 'Revisa y copia sugerencias de IA cuando estén disponibles.', 'Haz los cambios tú mismo y vuelve a analizar.'],
    faqHeading: 'Preguntas frecuentes', faq: [
      ['¿Qué puedo hacer con el plan gratuito?', 'Puedes analizar la página actual, revisar su puntuación SEO y los problemas, seguir las acciones recomendadas y volver a analizar después de los cambios.'],
      ['¿SEO Copilot cambia mi sitio automáticamente?', 'No. Revisas y copias una sugerencia, haces el cambio tú mismo y vuelves a analizar la página.'],
      ['¿Qué problemas admiten sugerencias de IA?', 'Actualmente se admiten algunos problemas de títulos y meta descripciones. No todos los problemas SEO admiten sugerencias de IA.'],
      ['¿Cómo se cuentan las sugerencias de IA?', 'Una solicitud de IA puede devolver varias opciones. «Generar otra vez» hace otra solicitud. Los límites finales de pago aún no están definidos.'],
      ['¿Puedo comprar un pase ahora?', 'Todavía no. Se están preparando pases breves de IA. Mientras tanto, puedes usar la extensión disponible.'],
      ['¿Qué pasa cuando caduca un pase?', 'El comportamiento al caducar y las reglas finales de acceso de pago aún se están definiendo. No hay pases de pago a la venta por ahora.'],
    ],
    finalHeading: 'Empieza con una revisión SEO gratuita', finalBody: 'Analiza una página, entiende sus problemas SEO y decide qué mejorar después.', featuresLink: 'Explorar funciones', privacyLink: 'Privacidad', termsLink: 'Términos de uso',
  },
  'pt-BR': {
    nav: 'Planos', title: 'Planos para verificar o SEO de uma página', description: 'Conheça a verificação SEO gratuita do SEO Copilot e os passes curtos planejados para sugestões de títulos e meta descriptions com IA. Os passes pagos ainda não estão disponíveis.',
    eyebrow: 'Planos', hero: 'Planos do SEO Copilot para verificar cada página', intro: 'Verifique gratuitamente a página que você está vendo. Estamos planejando acesso temporário a mais sugestões de títulos e meta descriptions com IA.',
    available: 'Disponível', soon: 'Em breve', plansHeading: 'Comece grátis e conheça os planos previstos', plansIntro: 'A verificação gratuita de páginas já está disponível. Os passes curtos de IA ainda estão em desenvolvimento.',
    freeName: 'Grátis', freeDescription: 'O essencial para verificar o SEO básico de uma página.', freeFeatures: ['Analisar a página atual', 'Pontuação SEO e relatório de problemas', 'Gravidade e ações recomendadas', 'Analisar novamente após mudanças'],
    dayName: 'Passe de 1 dia', dayDescription: 'Planejado para tarefas de SEO pontuais em uma ou poucas páginas.', weekName: 'Passe de 7 dias', weekDescription: 'Planejado para melhorar várias páginas ao longo de uma semana.',
    paidFeatures: ['Sugestões de títulos com IA para problemas compatíveis', 'Sugestões de meta descriptions com IA para problemas compatíveis', 'Gerar novamente dentro dos limites aplicáveis'], pending: 'Preço, limites de uso da IA e disponibilidade ainda estão sendo definidos.', install: 'Instalar no Chrome',
    compareHeading: 'Compare os recursos disponíveis e planejados', feature: 'Recurso', comparison: ['Análise SEO básica', 'Pontuação SEO e relatório de problemas', 'Ações recomendadas', 'Analisar novamente', 'Sugestões de títulos com IA', 'Sugestões de meta descriptions com IA', 'Gerar novamente', 'Duração do acesso pago'], included: 'Incluído', limited: 'Acesso gratuito limitado conforme as regras atuais do serviço', currentLimits: 'Sujeito aos limites atuais do serviço', planned: 'Planejado', plannedLimits: 'Limites a definir', notApplicable: 'Não se aplica', toConfirm: 'A confirmar', comparisonNote: 'As colunas dos passes pagos descrevem planos futuros; ainda não é possível comprá-los.',
    howHeading: 'Como funciona', steps: ['Analise a página que você está vendo.', 'Confira a pontuação SEO e os problemas.', 'Revise e copie sugestões de IA quando disponíveis.', 'Faça as alterações por conta própria e analise novamente.'],
    faqHeading: 'Perguntas frequentes', faq: [
      ['O que posso fazer com o plano grátis?', 'Você pode analisar a página atual, ver a pontuação SEO e os problemas, seguir as ações recomendadas e analisar novamente depois das mudanças.'],
      ['O SEO Copilot altera meu site automaticamente?', 'Não. Você revisa e copia uma sugestão, faz a alteração por conta própria e analisa a página novamente.'],
      ['Quais problemas aceitam sugestões de IA?', 'Atualmente, alguns problemas de títulos e meta descriptions são compatíveis. Nem todo problema de SEO aceita sugestões de IA.'],
      ['Como as sugestões de IA são contadas?', 'Uma solicitação de IA pode retornar várias opções. “Gerar novamente” faz outra solicitação. Os limites finais dos passes ainda estão sendo definidos.'],
      ['Posso comprar um passe agora?', 'Ainda não. Os passes curtos de IA estão sendo planejados. Você pode usar a extensão disponível enquanto isso.'],
      ['O que acontece quando um passe expira?', 'O funcionamento após a expiração e as regras finais do acesso pago ainda estão sendo definidos. Não há passes pagos à venda no momento.'],
    ],
    finalHeading: 'Comece com uma verificação SEO gratuita', finalBody: 'Analise uma página, entenda os problemas de SEO e escolha o que melhorar depois.', featuresLink: 'Ver recursos', privacyLink: 'Privacidade', termsLink: 'Termos de uso',
  },
};

export function getPricingCopy(locale: Locale): PricingCopy { return pricingCopy[locale]; }
