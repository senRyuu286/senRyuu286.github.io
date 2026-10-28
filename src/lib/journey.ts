export interface JourneyStop {
  title: string;
  period: string;
  detail: string;
}

/** Placeholder stops until real ones are supplied. Keep them in order, oldest first. */
export const journey: JourneyStop[] = [
  { title: '[MILESTONE 1]', period: '[PERIOD]', detail: '[MILESTONE 1 DETAIL]' },
  { title: '[MILESTONE 2]', period: '[PERIOD]', detail: '[MILESTONE 2 DETAIL]' },
  { title: '[MILESTONE 3]', period: '[PERIOD]', detail: '[MILESTONE 3 DETAIL]' },
];