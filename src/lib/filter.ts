export const workTypes = ['Project', 'Certificate', 'Activity'] as const;
export type WorkType = (typeof workTypes)[number];

export const typeFilters: ReadonlyArray<{ label: string; type: WorkType | null }> = [
  { label: 'All', type: null },
  { label: 'Projects', type: 'Project' },
  { label: 'Certificates', type: 'Certificate' },
  { label: 'Activities', type: 'Activity' },
];

export interface Filterable {
  type: WorkType;
  /** Already normalized with buildSearchText(). */
  searchText: string;
}

export interface FilterState {
  query: string;
  type: WorkType | null;
}

export function isWorkType(value: string | undefined): value is WorkType {
  return workTypes.some((type) => type === value);
}

/** Lowercase, remove accents, collapse spaces. "Cañete  Lab" becomes "canete lab". */
export function normalize(text: string): string {
  return text.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/\s+/g, ' ').trim();
}

export function buildSearchText(parts: Array<string | undefined>): string {
  return normalize(parts.filter((part): part is string => part !== undefined).join(' '));
}

/** An item matches when its type fits and every typed word appears somewhere in its text. */
export function matches(item: Filterable, state: FilterState): boolean {
  if (state.type !== null && item.type !== state.type) return false;
  const words = normalize(state.query).split(' ').filter(Boolean);
  return words.every((word) => item.searchText.includes(word));
}