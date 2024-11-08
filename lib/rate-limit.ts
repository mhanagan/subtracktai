interface RateLimitResult {
  success: boolean;
  remaining?: number;
  reset?: Date;
}

const RATE_LIMIT = 5; // Maximum emails per hour per recipient
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

const rateLimitMap = new Map<string, { count: number; reset: number }>();

export async function rateLimit(email: string): Promise<RateLimitResult> {
  const now = Date.now();
  const record = rateLimitMap.get(email);

  // Clear expired rate limit records
  if (record && now > record.reset) {
    rateLimitMap.delete(email);
  }

  // Create new record if none exists
  if (!record) {
    rateLimitMap.set(email, {
      count: 1,
      reset: now + WINDOW_MS,
    });
    return { success: true, remaining: RATE_LIMIT - 1 };
  }

  // Check if rate limit exceeded
  if (record.count >= RATE_LIMIT) {
    return {
      success: false,
      remaining: 0,
      reset: new Date(record.reset),
    };
  }

  // Increment counter
  record.count += 1;
  rateLimitMap.set(email, record);

  return {
    success: true,
    remaining: RATE_LIMIT - record.count,
    reset: new Date(record.reset),
  };
}