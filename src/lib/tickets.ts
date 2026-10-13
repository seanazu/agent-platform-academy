import { useEffect, useState } from 'react';
import { course } from './course';
import type { Ticket } from './types';

export const TEAM_LABELS: Record<string, string> = {
  plat: 'Platform',
  devops: 'DevOps',
  be: 'Backend',
  shai: 'Shai',
  guild: 'Guilds',
  sec: 'Security',
  nave: 'Nave',
};

export const teamLabel = (team: string): string => TEAM_LABELS[team] ?? team;

const goalIds = course.parts.filter((p) => p.kind === 'walkthrough').map((p) => p.id);

let cache: Promise<Ticket[]> | undefined;

const fetchAll = (): Promise<Ticket[]> => {
  cache ??= Promise.all(
    goalIds.map(async (g) => {
      const res = await fetch(`${import.meta.env.BASE_URL}tickets/${g}.json`);
      if (!res.ok) return [] as Ticket[];
      const data = (await res.json()) as unknown;
      return Array.isArray(data) ? (data as Ticket[]) : [];
    }),
  ).then((groups) => groups.flat());
  return cache;
};

export type TicketsState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; tickets: Ticket[] };

export const useTickets = (): TicketsState => {
  const [state, setState] = useState<TicketsState>({ status: 'loading' });
  useEffect(() => {
    let alive = true;
    fetchAll()
      .then((tickets) => alive && setState({ status: 'ready', tickets }))
      .catch(() => alive && setState({ status: 'error' }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
};
