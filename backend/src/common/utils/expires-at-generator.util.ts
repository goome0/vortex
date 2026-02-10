export type ExpireInput = {
  minutes?: number;
  hours?: number;
  days?: number;
};

export function expiresAtGenerator(input: ExpireInput): Date {
  const now = new Date();

  const valueMinutes = input.minutes ?? 0;
  const valueHours = input.hours ?? 0;
  const valueDays = input.days ?? 0;

  const totalMs = valueMinutes * 60_000 + valueHours * 3_600_000 + valueDays * 86_400_000;

  const result = new Date(now.getTime() + totalMs);
  return result;
}
