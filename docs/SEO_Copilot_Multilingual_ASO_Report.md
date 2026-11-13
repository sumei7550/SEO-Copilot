# SEO Copilot 多语言 Chrome Web Store ASO 研究与本地化方案

研究日期：2026-11-03。基准：Chrome Web Store 当前公开页面（v1.3.1）及仓库文案。英文已经由负责人提交，本报告不提出英文改动。未访问开发者后台。

## 范围与结论

公开页面“Languages”列出 **22 种语言**：Deutsch, English, Indonesia, Melayu, Nederlands, Türkçe, español, français, italiano, polski, português (Brasil), português (Portugal), română, svenska, čeština, українська, हिन्दी, ไทย, 中文（中国）, 中文（台灣）, 日本語, 한국어。重点语言 de、fr、es、pt-BR、ja、ko、zh-CN、zh-TW 均可在对应 hl 页面看到独立本地化名称、短描述和长描述。**ru 不在公开语言清单，hl=ru 返回英文回退**；仓库 [ru.md](store-listing/ru.md) 是历史草稿，不代表上线。仓库 [store-listing](store-listing/) 的 23 个文件也不能等同于 22 个已启用商店语言。其余 14 种公开语言未逐项审核文案，本轮不对其完成度作推断。

公开页面呈现 5 张截图；本轮没有可靠方式确认各语言图片内文字是否不同。仓库仅核验到 [02-see-your-seo-score-1280x800.png](../store-assets/02-see-your-seo-score-1280x800.png)，其图片文字为英文（包括“See your SEO score”“Instant Page Audit”与旧版 v1.0.0 UI），不能认定它就是现行公开截图。图片本地化状态记为 Unknown。

## 数据与判断边界

Google 自动补全接口用于发现候选表达，SERP 和 Chrome Web Store 竞品用于核对措辞。均不构成搜索量或 KD 证明；本轮未获 Ahrefs、Semrush 等数据库授权，所有语言的搜索量和 KD 均为 **Unknown**。本轮未得到可核对的 Google 相关搜索模块数据，故不填充该证据。浏览器地区、个性化和时间会影响自动补全。竞品出现在搜索结果只说明被此次检索找到。Chrome 官方给出的扩展名称上限 75 字符、摘要上限 132 字符；本报告建议均按 Unicode 字符计数。

## 各语言关键词与优先级

| 语言 | 综合检查词 | Title / Meta 词 | 证据与当前文案问题 | 优先级 |
|---|---|---|---|---|
| de | SEO Check | Title-Tag prüfen；Meta Description prüfen | Google 自动补全出现 seo check website；SERP 使用 Onpage SEO 与 Title/Meta。 公开文案完整且事实准确；名称聚焦标题与 Meta，暂无搜索量证据支持改名。 | P2 |
| fr | audit SEO | balise title；méta-description | SERP 和商店竞品使用 audit SEO；自动补全出现 analyse seo page。 公开文案自然且边界准确；audit SEO 可作为以后 A/B 假设，暂不改。 | P2 |
| es | análisis SEO | título SEO；metadescripción | 自动补全出现 analisis seo pagina web；竞品短描述出现 auditoría SEO。 公开文案事实准确；当前 Verificador 也自然，暂无证据证明改为 Análisis 更优。 | P2 |
| pt-BR | análise SEO | auditoria de SEO；title tag | SERP 使用 análise/analisador；自动补全出现 verificador de seo gratuito。 现用 Verificador 与本地表达一致；仅英文技术术语穿插，属当地 SEO 常用写法。 | P2 |
| ja | SEOチェック | titleタグ；メタディスクリプション | SERP 使用 SEOチェック、SEO診断、メタディスクリプション。 公开文案完整；名称中的 メタ説明 较通俗，正文使用 メタディスクリプション。 | P2 |
| ko | SEO 검사 | 온페이지 SEO；메타 설명 | 自动补全出现 seo 검사기；本地竞品使用 SEO 검사、메타 설명。 名称、短描述与竞品常见术语一致；暂无必要重写。 | P2 |
| zh-CN | SEO 检测 | 标题检查；元描述 | 自动补全出现 SEO 检测工具、网站 SEO 检测；SERP 使用标题、描述。 公开文案准确；独立商店语言已启用。 | P2 |
| zh-TW | SEO 檢查 | 標題標記；中繼描述 | Google 官方繁中资料使用 中繼說明；本轮自动补全仅返回 seo 檢查，商店本地竞品证据不足。 公开文案准确；中繼描述与中繼說明存在术语差异，但无搜索需求证据支持改动。 | P2 |
| ru | проверка SEO страницы | метаописание；проверка title | 自动补全出现 проверка seo страницы；商店当前为英文回退，且俄语不在 22 种公开语言清单内。 俄语没有独立公开商店文案，hl=ru 显示英文；仓库俄语稿不能视为已上线。 | P0 |

搜索量支持的关键词：**无可核实数据**。只有自动补全或 SERP / 商店文案支持的候选词见上表和工作簿 Keyword Research。浏览器扩展词多为产品类别表达，尚无需求量证据，故不为此强行改名。

## 竞品观察

| 语言 | 竞品名称 | 公开短描述 | 观察 |
|---|---|---|---|
| de | [SEO & GEO Helper by Farbentour](https://chromewebstore.google.com/detail/edofdmagoenlofkchbnclldojhjmhoda?hl=de) | A powerful SEO and GEO analysis tool for your browser. | 仅作为本地措辞证据；用户数/评分本轮未稳定采集 |
| fr | [RankFlow SEO : Audit SEO & Score en 1 clic](https://chromewebstore.google.com/detail/bgaflefjafighppoeekpddhepkjpohlf?hl=fr) | Extension SEO : audit SEO de toute page en 1 clic, score /100, SEO checker on-page, score GEO et E-E-A-T. 5 analyses offertes. | 仅作为本地措辞证据；用户数/评分本轮未稳定采集 |
| es | [RankLens SEO Inspector](https://chromewebstore.google.com/detail/apdmmpnphmafababdnmoaiaomaoaimie?hl=es) | Auditoría SEO + GEO profesional en tu panel: metadatos, encabezados, Core Web Vitals, keywords, seguridad y posiciones. | 仅作为本地措辞证据；用户数/评分本轮未稳定采集 |
| pt-BR | [Tempus Tech - SEO Analyzer](https://chromewebstore.google.com/detail/cobhgjojddnffnmcipobjaodngljkglm?hl=pt-BR) | Ferramenta de marketing e tecnologia para auditoria instantânea de tags on-page. | 仅作为本地措辞证据；用户数/评分本轮未稳定采集 |
| ja | [SEO品質チェッカー](https://chromewebstore.google.com/detail/hknoapgodjhicmifdkdnhdpnkmmeecea?hl=ja) | SEOページ分析をChromeで即時チェック。構造化データ、見出し、キーワード、リンク、表示速度を分析。 | 仅作为本地措辞证据；用户数/评分本轮未稳定采集 |
| ko | [SEO Checker](https://chromewebstore.google.com/detail/aklhdocmgpelkhpokopkcepgofimmooc?hl=ko) | 웹사이트 분석 및 최적화 툴, SEO Check. 구글 SEO, 네이버 블로그 SEO, 유튜브 SEO, 콘텐츠 SEO, 테크니컬 SEO 진단으로 순위 향상. 워드프레스 SEO 지원. | 仅作为本地措辞证据；用户数/评分本轮未稳定采集 |
| zh-CN | [Ahrefs SEO Toolbar](https://chromewebstore.google.com/detail/hgmoccdbjhknikckedaaebbpdeebhiei?hl=zh-CN) | 通过一款完整的SEO扩展工具节省大量时间。在任何网页上都能获得关于页面优化、关键词分析和链接分析的见解。 | 仅作为本地措辞证据；用户数/评分本轮未稳定采集 |
| zh-TW | [Ahrefs SEO Toolbar](https://chromewebstore.google.com/detail/hgmoccdbjhknikckedaaebbpdeebhiei?hl=zh-TW) | Save hours with a complete toolkit in one SEO extension. Insights for on-page, keyword research, and link analysis on any webpage. | 仅作为本地措辞证据；用户数/评分本轮未稳定采集 |
| ru | [MVweb SEO Inspector](https://chromewebstore.google.com/detail/gglfldanamibbmmmdabghhbjjjdpgcak?hl=ru) | Показывает все мета-данные и основную SEO-информацию страницы | 仅作为本地措辞证据；用户数/评分本轮未稳定采集 |

## 文案建议（可直接复核）

对已启用的八种重点语言，建议 **保留公开版名称、短描述与长描述**。理由：现版保留品牌，名称低于 75 字符，短描述低于 132 字符；首段清楚定位当前页面扫描，正文覆盖 SEO 分数、问题及严重程度、Title/Meta、使用步骤、本地扫描与主动请求 AI 的传输条件，也没有宣传自动改站、无限生成或批量审计。关键词研究尚无定量证据支持替换上线文案。以下逐语言完整列出建议稿，方便后续审核；“保留”指与公开版一致，并非采用仓库旧稿。

### de — P2（保留当前公开版）

- 名称（41/75）：SEO Copilot – KI-Checker für Titel & Meta
- 短描述（131/132）：SEO vor der Veröffentlichung prüfen, Titel- und Meta-Probleme priorisieren, KI-Vorschläge erhalten und nach Änderungen neu scannen.
- 主关键词：SEO Check；辅助词：Onpage SEO、Title-Tag prüfen、Meta Description prüfen、Chrome SEO Erweiterung；品牌词：SEO Copilot。
- 布局：品牌在名称；Title/Meta 词在名称或短描述；综合检查词与其他辅助词自然出现在长描述。未获得搜索量或 KD 证据的词不因臆测而重复堆砌。
- 判断：公开文案完整且事实准确；名称聚焦标题与 Meta，暂无搜索量证据支持改名。

**长描述建议稿：**

~~~text
SEO Copilot hilft Ihnen dabei, die aktuell in Chrome geöffnete Seite zu prüfen, typische Optimierungsprobleme zu erkennen und besser einzuschätzen, welche Bereiche vor der Veröffentlichung Aufmerksamkeit benötigen.

Nach einem Scan sehen Sie eine Bewertung von 0 bis 100, den Schweregrad erkannter Probleme und praktische Hinweise. Die Erweiterung prüft unter anderem Title-Tags, Meta-Beschreibungen, Überschriften, Canonical-Tags, strukturierte Daten, Alt-Texte von Bildern, die URL-Struktur und weitere relevante Seitenelemente.

Bei unterstützten Problemen mit Title-Tags und Meta-Beschreibungen können Sie KI-gestützte Vorschläge auf Grundlage des aktuellen Seitenkontexts anfordern. SEO Copilot erstellt mehrere Varianten, die Sie vergleichen, auswählen und für die weitere Bearbeitung im CMS oder Code kopieren können.

Die KI-Vorschläge sind optional und sollen Ihren Bearbeitungsprozess unterstützen. SEO Copilot nimmt keine automatischen Änderungen an Ihrer Website vor.

So funktioniert es

1. Öffnen Sie die Seite, die Sie prüfen möchten.
2. Starten Sie SEO Copilot.
3. Prüfen Sie Bewertung, Schweregrad und erkannte Probleme.
4. Fordern Sie KI-Vorschläge an, wenn diese verfügbar sind.
5. Nehmen Sie Änderungen selbst im CMS oder Code vor.
6. Scannen Sie die Seite erneut, um den aktuellen Stand zu prüfen.

Wichtige Funktionen

- Analyse der aktuell geöffneten Seite
- Bewertung von 0 bis 100 und Schweregrade
- Prüfung von Title-Tags und Meta-Beschreibungen
- Prüfung der Überschriftenstruktur
- Kontrolle von Canonical-Tags und strukturierten Daten
- Prüfung von Bild-Alt-Texten und URLs
- optionale KI-Vorschläge für unterstützte Title- und Meta-Probleme
- erneuter Scan nach vorgenommenen Änderungen

SEO Copilot eignet sich für schnelle Seitenprüfungen vor der Veröffentlichung oder nach Aktualisierungen von Landingpages, Artikeln, Produktseiten, Preisseiten, Dokumentationen und anderen Webinhalten.

Datenschutz und Grenzen

Die grundlegende Seitenanalyse läuft auf Ihrem Gerät. Wenn Sie ausdrücklich eine KI-Empfehlung anfordern, wird der dafür notwendige Seitenkontext an das SEO Copilot Backend und den verwendeten KI-Anbieter gesendet, um die Empfehlung zu erzeugen.

SEO Copilot bearbeitet Websites nicht automatisch, garantiert keine besseren Suchmaschinenplatzierungen und ersetzt keine professionelle Prüfung. KI-generierte Vorschläge sollten vor der Verwendung überprüft werden.
~~~

**来源：**[当前公开页面](https://chromewebstore.google.com/detail/kjkjgpmhjilegalgphglnagjnfgnighb?hl=de)；[术语证据 1](https://seitenpruefer.de/)、[术语证据 2](https://www.matthiasklenk.de/tools/onpage-analyse/)。

### fr — P2（保留当前公开版）

- 名称（48/75）：SEO Copilot – Vérificateur IA de titres et métas
- 短描述（120/132）：Vérifiez le SEO avant publication, priorisez le titre et la méta-description, obtenez des suggestions IA, puis rescanez.
- 主关键词：audit SEO；辅助词：analyse SEO、balise title、méta-description、extension Chrome SEO；品牌词：SEO Copilot。
- 布局：品牌在名称；Title/Meta 词在名称或短描述；综合检查词与其他辅助词自然出现在长描述。未获得搜索量或 KD 证据的词不因臆测而重复堆砌。
- 判断：公开文案自然且边界准确；audit SEO 可作为以后 A/B 假设，暂不改。

**长描述建议稿：**

~~~text
SEO Copilot vous aide à examiner la page actuellement ouverte dans Chrome, à repérer les problèmes courants et à comprendre quels éléments méritent votre attention avant publication.

Après un scan, vous obtenez une note de 0 à 100, le niveau de gravité des problèmes détectés et des recommandations pratiques. L’extension vérifie notamment la balise title, la méta-description, la structure des titres, la balise canonical, les données structurées, les textes alternatifs des images, la structure de l’URL et d’autres éléments de la page.

Pour les problèmes compatibles liés au title ou à la méta-description, vous pouvez demander des suggestions assistées par IA à partir du contexte de la page actuelle. SEO Copilot propose plusieurs variantes que vous pouvez comparer, sélectionner et copier pour les utiliser ensuite dans votre CMS ou votre code.

Les suggestions IA sont facultatives et servent à accompagner votre travail d’édition. SEO Copilot ne modifie pas automatiquement votre site.

Comment ça fonctionne

1. Ouvrez la page que vous souhaitez examiner.
2. Lancez SEO Copilot.
3. Consultez la note et les problèmes détectés.
4. Demandez des suggestions IA lorsqu’elles sont disponibles.
5. Appliquez vous-même les modifications dans votre CMS ou votre code.
6. Effectuez un nouveau scan pour vérifier l’état mis à jour de la page.

Fonctions principales

- analyse de la page actuellement ouverte
- note de 0 à 100 et niveau de gravité des problèmes
- vérification du title et de la méta-description
- analyse de la structure des titres
- contrôle de la balise canonical et des données structurées
- vérification des textes alternatifs des images et des URL
- suggestions IA facultatives pour les problèmes pris en charge
- nouveau scan après vos modifications

SEO Copilot est pratique pour vérifier rapidement une page avant publication ou après une mise à jour, qu’il s’agisse d’une landing page, d’un article, d’une fiche produit, d’une page tarifaire, d’une documentation ou d’un autre contenu web.

Confidentialité et limites

L’analyse de base de la page s’effectue sur votre appareil. Lorsque vous demandez explicitement une suggestion IA, le contexte nécessaire de la page est envoyé au backend de SEO Copilot et à son fournisseur d’IA afin de générer la recommandation.

SEO Copilot ne modifie pas automatiquement les sites, ne garantit pas de meilleures positions dans les moteurs de recherche et ne remplace pas une vérification professionnelle. Les suggestions générées par l’IA doivent être vérifiées avant utilisation.
~~~

**来源：**[当前公开页面](https://chromewebstore.google.com/detail/kjkjgpmhjilegalgphglnagjnfgnighb?hl=fr)；[术语证据 1](https://capston.ai/fr/extension-chrome-audit-seo/)、[术语证据 2](https://chromewebstore.google.com/detail/rankflow-seo-audit-seo-sc/bgaflefjafighppoeekpddhepkjpohlf?hl=fr)。

### es — P2（保留当前公开版）

- 名称（49/75）：SEO Copilot – Verificador de título y meta con IA
- 短描述（123/132）：Comprueba el SEO antes de publicar, prioriza el título y la metadescripción, genera sugerencias con IA y vuelve a analizar.
- 主关键词：análisis SEO；辅助词：auditoría SEO、título SEO、metadescripción、extensión SEO Chrome；品牌词：SEO Copilot。
- 布局：品牌在名称；Title/Meta 词在名称或短描述；综合检查词与其他辅助词自然出现在长描述。未获得搜索量或 KD 证据的词不因臆测而重复堆砌。
- 判断：公开文案事实准确；当前 Verificador 也自然，暂无证据证明改为 Análisis 更优。

**长描述建议稿：**

~~~text
SEO Copilot te ayuda a revisar la página que tienes abierta en Chrome, detectar problemas habituales y entender qué elementos necesitan atención antes de publicar.

Después del escaneo, verás una puntuación de 0 a 100, el nivel de gravedad de los problemas detectados y recomendaciones prácticas. La extensión revisa elementos como la etiqueta title, la metadescripción, la estructura de encabezados, la etiqueta canonical, los datos estructurados, los textos alternativos de las imágenes, la estructura de la URL y otros elementos relevantes de la página.

Para los problemas compatibles relacionados con la etiqueta title y la metadescripción, puedes solicitar sugerencias con IA basadas en el contexto de la página actual. SEO Copilot ofrece varias opciones que puedes comparar, seleccionar y copiar para seguir editándolas en tu CMS o en el código.

Las sugerencias con IA son opcionales y están pensadas para ayudarte durante el proceso de edición. SEO Copilot no modifica tu sitio automáticamente.

Cómo funciona

1. Abre en Chrome la página que quieres revisar.
2. Inicia SEO Copilot.
3. Consulta la puntuación y los problemas detectados.
4. Solicita sugerencias con IA cuando estén disponibles.
5. Realiza los cambios manualmente en tu CMS o en el código.
6. Vuelve a escanear la página para comprobar su estado actualizado.

Funciones principales

- escaneo de la página actualmente abierta
- puntuación de 0 a 100 y nivel de gravedad de los problemas
- revisión de la etiqueta title y la metadescripción
- revisión del H1 y de la estructura de encabezados
- comprobación de la etiqueta canonical y los datos estructurados
- revisión de los textos alternativos de las imágenes y las URL
- sugerencias opcionales con IA para problemas compatibles
- nuevo escaneo después de realizar cambios

SEO Copilot es útil para revisiones rápidas antes de publicar o después de actualizar landing pages, artículos, fichas de producto, páginas de precios, documentación y otros contenidos web.

Privacidad y limitaciones

El escaneo básico de la página se realiza en tu dispositivo. Cuando solicitas expresamente una sugerencia con IA, el contexto necesario de la página se envía al backend de SEO Copilot y a su proveedor de IA para generar la recomendación.

SEO Copilot no modifica sitios automáticamente, no garantiza mejores posiciones en los motores de búsqueda y no sustituye una revisión profesional. Revisa las sugerencias generadas por IA antes de utilizarlas.
~~~

**来源：**[当前公开页面](https://chromewebstore.google.com/detail/kjkjgpmhjilegalgphglnagjnfgnighb?hl=es)；[术语证据 1](https://chromewebstore.google.com/detail/ranklens-seo-inspector/apdmmpnphmafababdnmoaiaomaoaimie)、[术语证据 2](https://www.google.com/search?q=analisis+seo+pagina)。

### pt-BR — P2（保留当前公开版）

- 名称（49/75）：SEO Copilot – Verificador de título e meta com IA
- 短描述（125/132）：Verifique o SEO antes de publicar, priorize título e meta description, gere sugestões com IA e analise novamente após editar.
- 主关键词：análise SEO；辅助词：verificador de SEO、auditoria de SEO、title tag、meta description；品牌词：SEO Copilot。
- 布局：品牌在名称；Title/Meta 词在名称或短描述；综合检查词与其他辅助词自然出现在长描述。未获得搜索量或 KD 证据的词不因臆测而重复堆砌。
- 判断：现用 Verificador 与本地表达一致；仅英文技术术语穿插，属当地 SEO 常用写法。

**长描述建议稿：**

~~~text
SEO Copilot ajuda você a revisar a página que está aberta no Chrome, identificar problemas comuns e entender quais elementos merecem atenção antes da publicação.

Após a análise, você verá uma pontuação de 0 a 100, o nível de gravidade dos problemas detectados e recomendações práticas. A extensão verifica elementos como title tag, meta description, estrutura de headings, tag canonical, dados estruturados, textos alternativos de imagens, estrutura da URL e outros sinais relevantes da página.

Para problemas compatíveis relacionados à title tag e à meta description, você pode solicitar sugestões com IA com base no contexto da página atual. O SEO Copilot oferece várias opções que podem ser comparadas, selecionadas e copiadas para edição posterior no CMS ou no código.

As sugestões com IA são opcionais e servem para apoiar seu processo de edição. O SEO Copilot não modifica seu site automaticamente.

Como funciona

1. Abra no Chrome a página que deseja revisar.
2. Inicie o SEO Copilot.
3. Consulte a pontuação e os problemas detectados.
4. Solicite sugestões com IA quando estiverem disponíveis.
5. Faça as alterações manualmente no CMS ou no código.
6. Analise novamente a página para verificar o estado atualizado.

Principais recursos

- análise da página atualmente aberta
- pontuação de 0 a 100 e nível de gravidade dos problemas
- verificação de title tag e meta description
- análise de H1 e estrutura de headings
- verificação da tag canonical e de dados estruturados
- verificação de textos alternativos de imagens e URLs
- sugestões opcionais com IA para problemas compatíveis
- nova análise após as alterações

O SEO Copilot é útil para revisões rápidas antes da publicação ou depois de atualizar landing pages, artigos, páginas de produto, páginas de preços, documentação e outros conteúdos da web.

Privacidade e limitações

A análise básica da página é executada no seu dispositivo. Quando você solicita explicitamente uma sugestão com IA, o contexto necessário da página é enviado ao backend do SEO Copilot e ao provedor de IA para gerar a recomendação.

O SEO Copilot não modifica sites automaticamente, não garante melhores posições nos mecanismos de busca e não substitui uma revisão profissional. Revise as sugestões geradas pela IA antes de usá-las.
~~~

**来源：**[当前公开页面](https://chromewebstore.google.com/detail/kjkjgpmhjilegalgphglnagjnfgnighb?hl=pt-BR)；[术语证据 1](https://chromewebstore.google.com/detail/tempus-tech-seo-analyzer/cobhgjojddnffnmcipobjaodngljkglm)、[术语证据 2](https://www.feraexperience.com.br/ferramentas/analisador-seo/)。

### ja — P2（保留当前公开版）

- 名称（30/75）：SEO Copilot – AIタイトル・メタ説明チェッカー
- 短描述（54/132）：公開前にページSEOを確認し、タイトルとメタ説明の問題を優先。AI提案を生成し、編集後に再スキャンできます。
- 主关键词：SEOチェック；辅助词：SEO診断、titleタグ、メタディスクリプション、Chrome拡張；品牌词：SEO Copilot。
- 布局：品牌在名称；Title/Meta 词在名称或短描述；综合检查词与其他辅助词自然出现在长描述。未获得搜索量或 KD 证据的词不因臆测而重复堆砌。
- 判断：公开文案完整；名称中的 メタ説明 较通俗，正文使用 メタディスクリプション。

**长描述建议稿：**

~~~text
SEO Copilotは、Chromeで現在開いているページを確認し、一般的な問題を見つけて、公開前にどの部分を見直すべきか把握するためのツールです。

スキャン後は、0〜100のスコア、検出された問題、その重要度、実用的な案内を確認できます。チェック対象には、titleタグ、メタディスクリプション、見出し構造、canonicalタグ、構造化データ、画像のaltテキスト、URL構造などが含まれます。

対応しているtitleやメタディスクリプションの問題では、現在のページ内容をもとにAI提案をリクエストできます。SEO Copilotは複数の候補を表示するため、内容を比較し、適切な案を選んでコピーできます。

AI提案は任意で利用でき、編集作業を補助するための機能です。SEO Copilotがサイトを自動的に変更することはありません。

使い方

1. Chromeで確認したいページを開きます。
2. SEO Copilotを起動します。
3. スコアと検出された問題を確認します。
4. 対応している項目でAI提案をリクエストします。
5. 必要な変更はCMSやコードで自分で行います。
6. 変更後に再スキャンして最新の状態を確認します。

主な機能

- 現在開いているページのスキャン
- 0〜100のスコアと問題の重要度表示
- titleタグとメタディスクリプションの確認
- H1や見出し構造の確認
- canonicalタグと構造化データの確認
- 画像のaltテキストとURLの確認
- 対応するtitle・メタディスクリプション問題への任意のAI提案
- 変更後の再スキャン

SEO Copilotは、ランディングページ、記事、商品ページ、料金ページ、ドキュメントなどを公開前や更新後にすばやく確認する用途に適しています。

プライバシーと制限

基本的なページスキャンはユーザーの端末上で実行されます。ユーザーが明示的にAI提案をリクエストした場合のみ、提案生成に必要なページコンテキストがSEO CopilotのバックエンドとAIプロバイダーに送信されます。

SEO Copilotはサイトを自動的に変更せず、検索順位の向上を保証せず、専門的な確認の代わりになるものではありません。AIで生成された提案は、使用前に内容を確認してください。
~~~

**来源：**[当前公开页面](https://chromewebstore.google.com/detail/kjkjgpmhjilegalgphglnagjnfgnighb?hl=ja)；[术语证据 1](https://umarketing.co.jp/product/seo-quality-checker/)、[术语证据 2](https://ahrefs.com/ja/seo-toolbar)。

### ko — P2（保留当前公开版）

- 名称（29/75）：SEO Copilot – AI 제목·메타 설명 검사기
- 短描述（70/132）：게시 전에 페이지 SEO를 검사하고 제목과 메타 설명 문제를 우선 확인하세요. AI 제안을 생성하고 수정 후 다시 스캔합니다.
- 主关键词：SEO 검사；辅助词：SEO 분석、온페이지 SEO、메타 설명、크롬 확장 프로그램；品牌词：SEO Copilot。
- 布局：品牌在名称；Title/Meta 词在名称或短描述；综合检查词与其他辅助词自然出现在长描述。未获得搜索量或 KD 证据的词不因臆测而重复堆砌。
- 判断：名称、短描述与竞品常见术语一致；暂无必要重写。

**长描述建议稿：**

~~~text
SEO Copilot은 Chrome에서 현재 열려 있는 페이지를 빠르게 점검하고, 일반적인 최적화 문제를 확인할 수 있도록 도와주는 도구입니다.

페이지를 스캔하면 0~100점의 점수, 감지된 문제와 중요도, 그리고 실질적인 안내를 확인할 수 있습니다. 검사 항목에는 title 태그, 메타 설명, 헤딩 구조, canonical 태그, 구조화 데이터, 이미지 alt 텍스트, URL 구조 및 기타 페이지 요소가 포함됩니다.

지원되는 title 및 메타 설명 문제의 경우, 현재 페이지의 내용을 바탕으로 AI 제안을 요청할 수 있습니다. SEO Copilot은 여러 가지 후보를 제공하며, 사용자는 내용을 비교하고 가장 적합한 항목을 선택한 뒤 CMS나 코드에서 사용할 수 있도록 복사할 수 있습니다.

AI 제안은 선택적으로 사용하는 기능이며 편집 작업을 돕기 위한 것입니다. SEO Copilot은 웹사이트를 자동으로 수정하지 않습니다.

사용 방법

1. 점검하려는 페이지를 Chrome에서 엽니다.
2. SEO Copilot을 실행합니다.
3. 점수와 감지된 문제를 확인합니다.
4. 지원되는 항목에서 AI 제안을 요청합니다.
5. 필요한 변경은 CMS나 코드에서 직접 적용합니다.
6. 페이지를 다시 스캔해 최신 상태를 확인합니다.

주요 기능

- 현재 페이지 스캔
- 0~100점 평가와 문제 중요도 표시
- title 태그와 메타 설명 점검
- H1 및 헤딩 구조 확인
- canonical 태그와 구조화 데이터 확인
- 이미지 alt 텍스트와 URL 점검
- 지원되는 title 및 메타 설명 문제에 대한 선택적 AI 제안
- 수정 후 다시 스캔

SEO Copilot은 랜딩 페이지, 블로그 글, 상품 페이지, 가격 페이지, 문서 등 다양한 웹 콘텐츠를 게시 전이나 수정 후에 빠르게 점검할 때 사용할 수 있습니다.

개인정보 및 제한 사항

기본 페이지 스캔은 사용자 기기에서 실행됩니다. 사용자가 명시적으로 AI 제안을 요청하면 추천을 생성하는 데 필요한 페이지 문맥이 SEO Copilot 백엔드와 AI 제공업체로 전송됩니다.

SEO Copilot은 웹사이트를 자동으로 수정하지 않으며, 검색 순위 향상을 보장하지 않고, 전문적인 검토를 대신하지 않습니다. AI로 생성된 제안은 사용 전에 확인하는 것이 좋습니다.
~~~

**来源：**[当前公开页面](https://chromewebstore.google.com/detail/kjkjgpmhjilegalgphglnagjnfgnighb?hl=ko)；[术语证据 1](https://chromewebstore.google.com/detail/on-page-seo-checker/aklhdocmgpelkhpokopkcepgofimmooc?hl=ko)。

### zh-CN — P2（保留当前公开版）

- 名称（26/75）：SEO Copilot – AI 标题与元描述检查器
- 短描述（46/132）：发布前检查单页 SEO，优先定位标题与元描述问题，生成 AI 优化建议，并在修改后重新扫描。
- 主关键词：SEO 检测；辅助词：页面 SEO、标题检查、元描述、Chrome 扩展；品牌词：SEO Copilot。
- 布局：品牌在名称；Title/Meta 词在名称或短描述；综合检查词与其他辅助词自然出现在长描述。未获得搜索量或 KD 证据的词不因臆测而重复堆砌。
- 判断：公开文案准确；独立商店语言已启用。

**长描述建议稿：**

~~~text
SEO Copilot 帮助你检查 Chrome 当前打开的网页，发现常见问题，并了解在发布前哪些部分值得优先处理。

完成扫描后，你可以查看 0–100 的页面分数、检测到的问题、严重程度以及对应的处理建议。检查范围包括 title 标签、meta description、标题结构、canonical 标签、结构化数据、图片 alt 文本、URL 结构以及其他重要页面元素。

对于支持的 title 和 meta description 问题，你可以根据当前页面内容请求 AI 建议。SEO Copilot 会提供多个候选方案，方便你比较、选择并复制，之后可在 CMS 或代码中自行编辑。

AI 建议属于可选功能，主要用于辅助内容编辑。SEO Copilot 不会自动修改你的网站。

使用方式

1. 在 Chrome 中打开需要检查的网页。
2. 启动 SEO Copilot。
3. 查看页面分数和检测到的问题。
4. 在支持的项目中请求 AI 建议。
5. 在 CMS 或代码中自行完成修改。
6. 修改后重新扫描，确认最新页面状态。

主要功能

- 扫描当前打开的网页
- 0–100 页面分数和问题严重程度
- 检查 title 标签和 meta description
- 检查 H1 和标题结构
- 检查 canonical 标签和结构化数据
- 检查图片 alt 文本和 URL
- 为支持的问题提供可选 AI 建议
- 修改后重新扫描

SEO Copilot 适合在发布前或更新后快速检查落地页、文章、商品页、价格页、文档以及其他网页内容。

隐私与限制

基础页面扫描在你的设备上运行。只有当你明确请求 AI 建议时，生成建议所需的页面上下文才会发送到 SEO Copilot 后端及其 AI 服务提供商。

SEO Copilot 不会自动修改网站，不保证搜索排名提升，也不能替代专业审核。使用 AI 生成的建议前，请先确认内容是否准确并适合当前页面。
~~~

**来源：**[当前公开页面](https://chromewebstore.google.com/detail/kjkjgpmhjilegalgphglnagjnfgnighb?hl=zh-CN)；[术语证据 1](https://sona.to/zh-cn/free-tools/seo-inspector)、[术语证据 2](https://chromewebstore.google.com/detail/ahrefs-seo-toolbar/hgmoccdbjhknikckedaaebbpdeebhiei?hl=zh)。

### zh-TW — P2（保留当前公开版）

- 名称（27/75）：SEO Copilot – AI 標題與中繼描述檢查器
- 短描述（48/132）：發布前檢查單頁 SEO，優先找出標題與中繼描述問題，產生 AI 最佳化建議，並在修改後重新掃描。
- 主关键词：SEO 檢查；辅助词：頁面 SEO、標題標記、中繼描述、Chrome 擴充功能；品牌词：SEO Copilot。
- 布局：品牌在名称；Title/Meta 词在名称或短描述；综合检查词与其他辅助词自然出现在长描述。未获得搜索量或 KD 证据的词不因臆测而重复堆砌。
- 判断：公开文案准确；中繼描述与中繼說明存在术语差异，但无搜索需求证据支持改动。

**长描述建议稿：**

~~~text
SEO Copilot 可協助你檢查 Chrome 目前開啟的網頁、找出常見問題，並了解在發布前哪些部分值得優先處理。

完成掃描後，你可以查看 0–100 的頁面分數、偵測到的問題與嚴重程度，以及實用的改善建議。檢查項目包括 title 標籤、meta description、標題結構、canonical 標籤、結構化資料、圖片 alt 文字、URL 結構及其他重要頁面元素。

針對支援的 title 和 meta description 問題，你可以依據目前頁面內容要求 AI 建議。SEO Copilot 會提供多個候選方案，讓你比較、選擇並複製，之後可在 CMS 或程式碼中自行編輯。

AI 建議為選用功能，目的是協助內容編輯流程。SEO Copilot 不會自動修改你的網站。

使用方式

1. 在 Chrome 開啟要檢查的網頁。
2. 啟動 SEO Copilot。
3. 查看頁面分數與偵測到的問題。
4. 在支援的項目中要求 AI 建議。
5. 在 CMS 或程式碼中自行完成修改。
6. 修改後重新掃描，確認最新頁面狀態。

主要功能

- 掃描目前開啟的網頁
- 0–100 頁面分數與問題嚴重程度
- 檢查 title 標籤與 meta description
- 檢查 H1 與標題結構
- 檢查 canonical 標籤與結構化資料
- 檢查圖片 alt 文字與 URL
- 為支援的問題提供選用 AI 建議
- 修改後重新掃描

SEO Copilot 適合用於發布前或更新後快速檢查到達頁、文章、商品頁、價格頁、文件與其他網頁內容。

隱私與限制

基本頁面掃描會在你的裝置上執行。只有當你明確要求 AI 建議時，產生建議所需的頁面內容脈絡才會傳送至 SEO Copilot 後端及其 AI 服務供應商。

SEO Copilot 不會自動修改網站、不保證搜尋排名提升，也不能取代專業檢查。使用 AI 產生的建議前，請先確認內容是否正確且適合目前頁面。
~~~

**来源：**[当前公开页面](https://chromewebstore.google.com/detail/kjkjgpmhjilegalgphglnagjnfgnighb?hl=zh-TW)；[术语证据 1](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=zh-tw)、[术语证据 2](https://developer.chrome.google.cn/docs/lighthouse/seo/meta-description?hl=zh-tw)。

### ru — P0（新建俄语文案，须先启用语言）

- 名称（35/75）：SEO Copilot — проверка SEO страницы
- 短描述（110/132）：Проверяйте SEO открытой страницы в Chrome: оценка, важность проблем и предложения ИИ для title и метаописания.
- 主关键词：проверка SEO страницы；辅助词：SEO-аудит、метаописание、проверка title、расширение Chrome для SEO；品牌词：SEO Copilot。
- 布局：品牌在名称；Title/Meta 词在名称或短描述；综合检查词与其他辅助词自然出现在长描述。未获得搜索量或 KD 证据的词不因臆测而重复堆砌。
- 判断：俄语没有独立公开商店文案，hl=ru 显示英文；仓库俄语稿不能视为已上线。

**长描述建议稿：**

~~~text
SEO Copilot помогает проверить SEO страницы, открытой в Chrome. Запустите сканирование, чтобы увидеть оценку SEO, найденные проблемы и их степень важности. Это проверка одной текущей страницы, а не аудит всего сайта.

Расширение анализирует поддерживаемые факторы внутренней оптимизации: title, метаописание, заголовки H1 и другие уровни, canonical, структурированные данные, alt-тексты изображений и URL. Для каждого обнаруженного вопроса доступны базовые пояснения, которые помогают определить порядок ручной работы.

Для поддерживаемых проблем с title и метаописанием можно запросить варианты от ИИ на основе контекста текущей страницы. Просмотрите предложения, выберите подходящее и скопируйте его. Предложения требуют проверки человеком; SEO Copilot не меняет сайт автоматически и не создаёт произвольные SEO-тексты для любых задач.

Как пользоваться: откройте страницу в Chrome, запустите SEO Copilot, проверьте оценку и проблемы. При необходимости запросите предложение ИИ для поддерживаемого title или метаописания. Затем самостоятельно внесите изменения в CMS или код и повторно просканируйте страницу. Учётная запись не нужна.

Базовое сканирование выполняется локально в браузере. Только когда вы сами запрашиваете предложение ИИ, необходимый контекст страницы передаётся серверу SEO Copilot и поставщику ИИ. Расширение не гарантирует улучшения позиций в поиске; проверяйте предложения перед использованием.
~~~

**来源：**[当前公开页面](https://chromewebstore.google.com/detail/kjkjgpmhjilegalgphglnagjnfgnighb?hl=ru)；[术语证据 1](https://www.oweb-solutions.ru/articles/seo-proverka-stranitsy-rasshirenie-dlya-brauzera/)、[术语证据 2](https://chromewebstore.google.com/detail/mvweb-seo-inspector/gglfldanamibbmmmdabghhbjjjdpgcak?hl=ru)。

## 执行顺序与验证要求

1. **P0 — ru**：仅在产品负责人决定启用俄语商店语言时，采用上面的俄语新稿，并在后台确认名称、摘要、长描述及截图的俄语预览。当前不在公开语言清单，不能称为已本地化。
2. **P2 — de、fr、es、pt-BR、ja、ko、zh-CN、zh-TW**：先保留。以后若获得逐市场搜索量、商店转化率或用户反馈，再评估名称与短描述实验。
3. 截图文字：公开截图逐张人工核验；本轮状态 Unknown。仓库旧截图的英文不能替代公开版判断。

本轮没有修改英文 ASO、Chrome Web Store 后台、扩展源码、官网 SEO 页面、图标、截图或版本。Excel 管理表：[SEO_Copilot_Multilingual_ASO.xlsx](SEO_Copilot_Multilingual_ASO.xlsx)。

## 核心来源

- [SEO Copilot 公开商店页](https://chromewebstore.google.com/detail/kjkjgpmhjilegalgphglnagjnfgnighb?hl=en)（22 语言列表和当前公开文案，2026-11-03 访问）。
- [Chrome 扩展名称与描述字段限制](https://developer.chrome.com/docs/extensions/reference/manifest)；[商店文案指南](https://developer.chrome.com/docs/webstore/best-listing)。
- [仓库产品事实](../PRODUCT_FACTS.md)；[仓库历史商店文案](store-listing/)。
