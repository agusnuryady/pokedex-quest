import { createRng, type Rng } from '@/domain/random';

/**
 * One random generator for the whole app session, seeded once when the app starts.
 * Screens share it, so each new battle continues the sequence instead of replaying it.
 * Tests inject their own Rng instead.
 */
export const sessionRng: Rng = createRng(Date.now() >>> 0);
