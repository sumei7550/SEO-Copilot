import type { AiFixRequest, AiFixResponse, Recommendation } from '../types/aiFix';

type MockRecommendations = Record<AiFixRequest['type'], Recommendation[]>;

const recommendations: MockRecommendations = {
  metaDescription: [
    { id: 'meta-1', content: "Plan, monitor, and improve enterprise SEO with Acme's all-in-one platform. Find technical issues, prioritize fixes, and grow organic traffic.", rationale: 'Includes the primary topic, benefits, and a clear outcome in a natural search-snippet length.', highlights: ['Contains target keyword', 'Improves search snippet', 'Clear value proposition'] },
    { id: 'meta-2', content: 'Acme Enterprise SEO Platform helps teams uncover SEO issues, optimize content, and track performance — all from one collaborative workspace.', rationale: 'Leads with the product name and speaks directly to an enterprise team use case.', highlights: ['Names the product', 'Matches team use case', 'Clear value proposition'] },
    { id: 'meta-3', content: "Scale organic growth with Acme's enterprise SEO platform. Audit pages, get actionable recommendations, and prove the impact of every fix.", rationale: 'Uses action verbs and finishes with a value proposition that encourages clicks.', highlights: ['Uses action verbs', 'Explains the benefit', 'Encourages clicks'] }
  ],
  title: [
    { id: 'title-1', content: 'Enterprise SEO Platform for Technical Audits & Growth | Acme', rationale: 'Covers the core topic and key benefit while remaining within a search-friendly length.', highlights: ['Matches search intent', 'Front-loads the key topic', 'Sets a clear click expectation'] },
    { id: 'title-2', content: 'Acme Enterprise SEO Platform — Find Issues, Grow Traffic', rationale: 'Pairs the product name with direct outcomes that match search intent.', highlights: ['Names the product', 'States direct outcomes', 'Matches search intent'] },
    { id: 'title-3', content: 'Technical SEO Software for Enterprise Teams | Acme', rationale: 'Makes the audience and the category immediately clear to searchers.', highlights: ['Defines the audience', 'Uses category language', 'Clear and concise'] }
  ],
  h1: [
    { id: 'h1-1', content: 'Enterprise SEO Platform for Smarter Organic Growth', rationale: 'Creates one focused page topic and connects the product to a clear outcome.', highlights: ['One clear primary topic', 'Includes core keyword', 'Communicates value'] },
    { id: 'h1-2', content: 'Grow Organic Traffic with Enterprise SEO Software', rationale: 'Leads with the visitor outcome while keeping the product category explicit.', highlights: ['Outcome-led wording', 'Matches search intent', 'Clear category'] },
    { id: 'h1-3', content: 'Technical SEO Tools Built for Enterprise Teams', rationale: 'Speaks directly to the intended audience and their technical SEO need.', highlights: ['Targets the audience', 'Specific topic', 'Scannable phrasing'] }
  ]
};

/** Mock provider boundary: replace this implementation when a real API is ready. */
export async function generateSeoFixMock(request: AiFixRequest): Promise<AiFixResponse> {
  await new Promise((resolve) => setTimeout(resolve, 180));
  const brand = request.context.brand.name;
  const length = request.type === 'metaDescription' ? request.context.metaDescription.length : request.context[request.type].length;
  const pageRecommendations = recommendations[request.type].map((recommendation) => ({
    ...recommendation,
    content: brand ? recommendation.content.replace(/Acme/g, brand) : recommendation.content,
    rationale: `${recommendation.rationale} Context: ${request.context.pageType} page, ${request.context.language} language, current length ${length}.`
  }));
  return { type: request.type, recommendations: pageRecommendations };
}
