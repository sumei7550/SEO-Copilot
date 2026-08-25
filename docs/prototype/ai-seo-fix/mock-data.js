const suggestions = {
  meta: [
    ["Plan, monitor, and improve enterprise SEO with Acme's all-in-one platform. Find technical issues, prioritize fixes, and grow organic traffic.", "Includes the primary topic, benefits, and a clear outcome in a natural search-snippet length."],
    ["Acme Enterprise SEO Platform helps teams uncover SEO issues, optimize content, and track performance — all from one collaborative workspace.", "Leads with the product name and speaks directly to an enterprise team use case."],
    ["Scale organic growth with Acme's enterprise SEO platform. Audit pages, get actionable recommendations, and prove the impact of every fix.", "Uses action verbs and finishes with a value proposition that encourages clicks."]
  ],
  title: [
    ["Enterprise SEO Platform for Technical Audits & Growth | Acme", "Covers the core topic and key benefit while remaining within a search-friendly length."],
    ["Acme Enterprise SEO Platform — Find Issues, Grow Traffic", "Pairs the product name with direct outcomes that match search intent."],
    ["Technical SEO Software for Enterprise Teams | Acme", "Makes the audience and the category immediately clear to searchers."]
  ]
};

const selected = { meta: 0, title: 0 };
const rotations = { meta: 0, title: 0 };
const reasons = {
  meta: ['Contains target keyword', 'Improves search snippet', 'Clear value proposition'],
  title: ['Matches target search intent', 'Front-loads the primary keyword', 'Sets a clear click expectation']
};

function renderSuggestions(type) {
  const container = document.getElementById(`${type}-suggestions`);
  const values = suggestions[type];
  const offset = rotations[type] % values.length;
  container.innerHTML = values.map((item, index) => {
    const actual = (index + offset) % values.length;
    const label = index === 0 ? 'Recommended' : `Alternative ${index}`;
    return `<button class="suggestion ${actual === selected[type] ? 'selected' : ''}" type="button" data-suggestion="${type}" data-index="${actual}"><span class="suggestion-top"><span class="suggestion-number">${label}</span><span class="select-mark">✓ Selected</span></span><span class="suggestion-copy">${item[0]}</span><span class="suggestion-reason"><b>Why this works</b><ul>${reasons[type].map(reason => `<li>✓ ${reason}</li>`).join('')}</ul><em>${item[1]}</em></span></button>`;
  }).join('');
  const preview = document.getElementById(`${type}-after-preview`);
  if (preview) preview.textContent = values[selected[type]][0];
}

function renderAll() { Object.keys(suggestions).forEach(renderSuggestions); }

document.addEventListener('click', async (event) => {
  const target = event.target.closest('button');
  if (!target) return;
  const type = target.dataset.fixToggle;
  if (type) {
    const card = target.closest('.issue-card');
    card.classList.toggle('is-open');
    target.querySelector('.chevron').classList.toggle('is-open', card.classList.contains('is-open'));
    return;
  }
  if (target.dataset.suggestion) { selected[target.dataset.suggestion] = Number(target.dataset.index); renderSuggestions(target.dataset.suggestion); return; }
  if (target.dataset.regenerate) { const kind = target.dataset.regenerate; rotations[kind] += 1; selected[kind] = rotations[kind] % suggestions[kind].length; renderSuggestions(kind); return; }
  if (target.dataset.copy) {
    const kind = target.dataset.copy; const text = suggestions[kind][selected[kind]][0];
    try { await navigator.clipboard.writeText(text); } catch { /* Preview feedback still confirms the intended action. */ }
    target.closest('.fix-panel').querySelector('.copy-feedback').textContent = 'Copied — paste this into your page source or CMS.';
    target.textContent = '✓ Copied'; setTimeout(() => { target.textContent = 'Copy selected'; }, 1500); return;
  }
  if (target.id === 'rescan') { document.getElementById('report-view').hidden = true; document.getElementById('verified-view').hidden = false; document.getElementById('score-value').textContent = '86'; document.getElementById('grade-value').textContent = 'Excellent'; document.getElementById('issue-summary').textContent = '5 issues found'; window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (target.id === 'back-to-report') { document.getElementById('verified-view').hidden = true; document.getElementById('report-view').hidden = false; }
});

renderAll();
