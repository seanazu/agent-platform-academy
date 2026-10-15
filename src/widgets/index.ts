import type { JSX } from 'react';
import FingerprintSim from './FingerprintSim';
import IdPolicySim from './IdPolicySim';
import JourneyBreak from './JourneyBreak';

export const WIDGETS: Record<string, (p: { config?: Record<string, unknown> }) => JSX.Element> = {
  'id-policy': IdPolicySim,
  fingerprint: FingerprintSim,
  'journey-break': JourneyBreak,
};
