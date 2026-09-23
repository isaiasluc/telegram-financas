// Brasil não observa horário de verão desde 2019, então o offset é fixo.
const SAO_PAULO_OFFSET_MS = 3 * 60 * 60 * 1000;

function toSaoPauloWallClock(date: Date): Date {
  return new Date(date.getTime() - SAO_PAULO_OFFSET_MS);
}

function fromSaoPauloWallClock(wallClock: Date): Date {
  return new Date(wallClock.getTime() + SAO_PAULO_OFFSET_MS);
}

export function getCurrentWeekRange(now: Date): { start: Date; end: Date } {
  const local = toSaoPauloWallClock(now);
  const daysSinceMonday = (local.getUTCDay() + 6) % 7;

  const startLocal = new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - daysSinceMonday),
  );
  const endLocal = new Date(
    Date.UTC(startLocal.getUTCFullYear(), startLocal.getUTCMonth(), startLocal.getUTCDate() + 7) - 1,
  );

  return { start: fromSaoPauloWallClock(startLocal), end: fromSaoPauloWallClock(endLocal) };
}

export function getCurrentMonthRange(now: Date): { start: Date; end: Date } {
  const local = toSaoPauloWallClock(now);

  const startLocal = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1));
  const endLocal = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 1) - 1);

  return { start: fromSaoPauloWallClock(startLocal), end: fromSaoPauloWallClock(endLocal) };
}
