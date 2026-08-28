import { createHash } from 'node:crypto';
import { SeoFixError } from './types.js';

const RESERVE_SCRIPT = `
local used = tonumber(redis.call('GET', KEYS[1]) or '0')
local pending = tonumber(redis.call('GET', KEYS[2]) or '0')
if used + pending >= tonumber(ARGV[1]) then return 'DAILY_QUOTA_EXCEEDED' end
if redis.call('EXISTS', KEYS[3]) == 1 then return 'RATE_LIMITED' end
local ipCount = tonumber(redis.call('GET', KEYS[4]) or '0')
if ipCount >= tonumber(ARGV[2]) then return 'RATE_LIMITED' end
local globalCount = tonumber(redis.call('GET', KEYS[5]) or '0')
if globalCount >= tonumber(ARGV[3]) then return 'SERVICE_LIMIT_REACHED' end
redis.call('INCR', KEYS[2]); redis.call('EXPIRE', KEYS[2], ARGV[4])
redis.call('INCR', KEYS[4]); redis.call('EXPIRE', KEYS[4], ARGV[5])
redis.call('INCR', KEYS[5]); redis.call('EXPIRE', KEYS[5], ARGV[6])
redis.call('SET', KEYS[3], '1', 'EX', ARGV[7])
return 'OK'`;
const FINALIZE_SCRIPT = `redis.call('DECR', KEYS[1]); if ARGV[1] == 'success' then redis.call('INCR', KEYS[2]); redis.call('EXPIRE', KEYS[2], ARGV[2]) end; return 'OK'`;

export interface RedisClient { eval(script: string, keys: string[], args: string[]): Promise<string>; }
export interface RateLimitConfig { redis?: RedisClient; dailyQuota?: number; ipPerMinute?: number; globalDailyLimit?: number; now?: () => Date; }
export interface AiRequestIdentity { deviceId: string; ip: string; }

export function getRedisRateLimiter(config: RateLimitConfig = {}) { return new AiRateLimiter({ ...config, redis: config.redis ?? createUpstashClient() }); }
export class AiRateLimiter {
  private readonly config: { redis?: RedisClient; dailyQuota: number; ipPerMinute: number; globalDailyLimit: number; now: () => Date };
  constructor(config: RateLimitConfig) { this.config = { redis: config.redis, dailyQuota: config.dailyQuota ?? 5, ipPerMinute: config.ipPerMinute ?? 3, globalDailyLimit: config.globalDailyLimit ?? Number(process.env.AI_DAILY_GLOBAL_LIMIT ?? 500), now: config.now ?? (() => new Date()) }; }
  async reserve(identity: AiRequestIdentity): Promise<(success?: boolean) => Promise<void>> {
    if (!this.config.redis) {
      if (process.env.VERCEL) throw new SeoFixError('SERVICE_LIMIT_REACHED', 'AI service protection is not configured.', true);
      return async () => undefined;
    }
    const date = this.config.now(); const day = date.toISOString().slice(0, 10); const minute = Math.floor(date.getTime() / 60_000);
    const deviceKey = `seo-copilot:ai:device:${safeDeviceId(identity.deviceId)}:${day}`;
    const pendingKey = `${deviceKey}:pending`; const cooldownKey = `${deviceKey}:cooldown`;
    const ipKey = `seo-copilot:ai:ip:${hashIp(identity.ip)}:${minute}`; const globalKey = `seo-copilot:ai:global:${day}`;
    const result = await this.config.redis.eval(RESERVE_SCRIPT, [deviceKey, pendingKey, cooldownKey, ipKey, globalKey], [String(this.config.dailyQuota), String(this.config.ipPerMinute), String(this.config.globalDailyLimit), '172800', '120', '172800', '10']);
    if (result !== 'OK') {
      const code = result as 'DAILY_QUOTA_EXCEEDED' | 'RATE_LIMITED' | 'SERVICE_LIMIT_REACHED';
      const message = code === 'DAILY_QUOTA_EXCEEDED' ? "Today's free AI limit has been reached. Try again tomorrow." : code === 'SERVICE_LIMIT_REACHED' ? 'AI service daily limit reached.' : 'Too many AI requests. Please try again shortly.';
      throw new SeoFixError(code, message, true);
    }
    let finalized = false;
    return async (success = false) => { if (finalized) return; finalized = true; await this.config.redis!.eval(FINALIZE_SCRIPT, [pendingKey, deviceKey], [success ? 'success' : 'failure', '172800']); };
  }
}
function safeDeviceId(value: string) { return /^[a-zA-Z0-9_-]{16,128}$/.test(value) ? value : 'invalid'; }
function hashIp(ip: string) { return createHash('sha256').update(`${process.env.AI_RATE_LIMIT_SALT ?? 'seo-copilot'}:${ip}`).digest('hex'); }
function createUpstashClient(): RedisClient | undefined { const url = process.env.UPSTASH_REDIS_REST_URL; const token = process.env.UPSTASH_REDIS_REST_TOKEN; if (!url || !token) return undefined; return { eval: async (script, keys, args) => { const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(['EVAL', script, String(keys.length), ...keys, ...args]) }); if (!response.ok) throw new Error('Redis unavailable'); const payload = await response.json() as { result?: unknown }; return String(payload.result ?? ''); } }; }
export function getClientIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }) { const forwarded = req.headers['x-forwarded-for']; return (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0])?.trim() || req.socket?.remoteAddress || 'unknown'; }
