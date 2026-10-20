import type { Metadata } from 'next';
import { PricingPage } from '@/components/PricingPage';
import { getPricingCopy } from '@/lib/pricing';
import { pageMetadata } from '@/lib/site';

const c = getPricingCopy('en');
export const metadata: Metadata = pageMetadata(c.title, c.description, 'pricing');

export default function Pricing() { return <PricingPage locale="en" />; }
