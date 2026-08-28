import { describe, expect, it } from 'vitest';
import { AiRateLimiter, type RedisClient } from './rateLimiter';

class FakeRedis implements RedisClient {
  private readonly values = new Map<string, number>();
  private readonly expiry = new Map<string, number>();
  async eval(script: string, keys: string[], args: string[]) {
    if (script.includes('DAILY_QUOTA_EXCEEDED')) {
      const [device, pending, cooldown, ip, global] = keys;
      if ((this.values.get(device) ?? 0) + (this.values.get(pending) ?? 0) >= Number(args[0])) return 'DAILY_QUOTA_EXCEEDED';
      if (this.values.has(cooldown)) return 'RATE_LIMITED';
      if ((this.values.get(ip) ?? 0) >= Number(args[1])) return 'RATE_LIMITED';
      if ((this.values.get(global) ?? 0) >= Number(args[2])) return 'SERVICE_LIMIT_REACHED';
      this.values.set(pending, (this.values.get(pending) ?? 0) + 1); this.values.set(ip, (this.values.get(ip) ?? 0) + 1); this.values.set(global, (this.values.get(global) ?? 0) + 1); this.values.set(cooldown, 1); this.expiry.set(cooldown, 10); return 'OK';
    }
    const [pending, device] = keys; this.values.set(pending, Math.max(0, (this.values.get(pending) ?? 0) - 1)); if (args[0] === 'success') this.values.set(device, (this.values.get(device) ?? 0) + 1); return 'OK';
  }
  advance(seconds: number) { for (const [key, ttl] of this.expiry) { if (ttl <= seconds) { this.expiry.delete(key); this.values.delete(key); } else this.expiry.set(key, ttl - seconds); } }
}

const identity = { deviceId: '0123456789abcdef0123456789abcdef', ip: '203.0.113.1' };
const limiter = (redis: FakeRedis, now = new Date('2026-08-28T00:00:00Z')) => new AiRateLimiter({ redis, now: () => now, ipPerMinute: 3, globalDailyLimit: 500 });

describe('AiRateLimiter', () => {
  it('allows five successful generations and rejects the sixth', async () => {
    const redis = new FakeRedis(); const gate = limiter(redis);
    for (let i = 0; i < 5; i++) { const release = await gate.reserve({ ...identity, ip: `203.0.113.${i + 1}` }); await release(true); redis.advance(10); }
    await expect(gate.reserve({ ...identity, ip: '203.0.113.99' })).rejects.toMatchObject({ code: 'DAILY_QUOTA_EXCEEDED' });
  });
  it('does not count failed provider requests, but enforces IP and cooldown', async () => {
    const redis = new FakeRedis(); const gate = limiter(redis); const release = await gate.reserve(identity); await release(false); redis.advance(10);
    const next = await gate.reserve(identity); await next(false); redis.advance(10);
    const third = await gate.reserve(identity); await third(false); redis.advance(10);
    await expect(gate.reserve(identity)).rejects.toMatchObject({ code: 'RATE_LIMITED' });
  });
  it('resets device quota on the next day and supports global circuit breaking', async () => {
    const redis = new FakeRedis(); let now = new Date('2026-08-28T00:00:00Z'); const gate = new AiRateLimiter({ redis, now: () => now, globalDailyLimit: 1 });
    const release = await gate.reserve(identity); await release(true); redis.advance(10);
    now = new Date('2026-08-29T00:00:00Z');
    const nextDay = await gate.reserve(identity); await nextDay(false);
    await expect(gate.reserve({ ...identity, deviceId: 'abcdef0123456789abcdef0123456789' })).rejects.toMatchObject({ code: 'SERVICE_LIMIT_REACHED' });
  });
});
