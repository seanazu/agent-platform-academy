import type { TicketCardData } from './types';

const files = import.meta.glob('../../content/cards/*.json', { eager: true, import: 'default' }) as Record<string, TicketCardData>;
const cards = new Map(Object.values(files).map((c) => [c.key, c]));

export const getCard = (key: string): TicketCardData | undefined => cards.get(key);
export const hasCard = (key: string): boolean => cards.has(key);
