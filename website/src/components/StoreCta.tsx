import { STORE_URL } from '@/lib/site';

export function StoreCta({ secondary = false, label }: { secondary?: boolean; label?: string }) { return <a id="store-link" className={`button ${secondary ? 'button-secondary' : 'button-primary'}`} href={STORE_URL} target="_blank" rel="noopener noreferrer">{label ?? (secondary ? 'Get the extension' : 'Install on Chrome')}</a>; }
