import { describe, expect, it } from 'vitest';
import { decrementCountdown, getAiFixErrorPresentation, getRateLimitCountdownSeconds } from './AiFixPanel';

describe('AiFixPanel error presentation', () => {
  it('shows RATE_LIMITED copy, countdown, and disables Retry while counting down', () => {
    const presentation = getAiFixErrorPresentation('RATE_LIMITED', 6);
    expect(presentation.lines).toEqual([
      "You're making requests too quickly.",
      'Please wait a few seconds and try again.',
    ]);
    expect(presentation.countdownLabel).toBe('Try again in 6s');
    expect(presentation.retry).toBe(true);
    expect(presentation.retryDisabled).toBe(true);
  });

  it('enables Retry after RATE_LIMITED countdown reaches zero', () => {
    const presentation = getAiFixErrorPresentation('RATE_LIMITED', 0);
    expect(presentation.countdownLabel).toBeUndefined();
    expect(presentation.retryDisabled).toBe(false);
  });

  it('uses server retry seconds first, falls back to retryAfter, then 10 seconds', () => {
    expect(getRateLimitCountdownSeconds({ retryAfterSeconds: 3, retryAfter: 8 })).toBe(3);
    expect(getRateLimitCountdownSeconds({ retryAfter: 8, retryAfterSeconds: undefined })).toBe(8);
    expect(getRateLimitCountdownSeconds({ retryAfter: undefined, retryAfterSeconds: undefined })).toBe(10);
    expect(decrementCountdown(6)).toBe(5);
    expect(decrementCountdown(1)).toBe(0);
  });

  it('does not offer immediate Retry for daily quota or service limit errors', () => {
    expect(getAiFixErrorPresentation('DAILY_QUOTA_EXCEEDED', 0)).toMatchObject({
      lines: ["Today's free AI limit has been reached.", 'Try again tomorrow.'], retry: false,
    });
    expect(getAiFixErrorPresentation('SERVICE_LIMIT_REACHED', 0)).toMatchObject({
      lines: ['AI service limit has been reached for today.', 'Please try again later.'], retry: false,
    });
  });

  it('keeps the generic copy and Retry for other errors', () => {
    expect(getAiFixErrorPresentation(undefined, 0)).toMatchObject({
      lines: ['AI suggestions unavailable.', 'Please try again.'], retry: true, retryDisabled: false,
    });
  });
});
