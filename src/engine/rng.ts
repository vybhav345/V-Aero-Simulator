/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Fast, deterministic Mulberry32 seeded Pseudo-Random Number Generator.
 * Provides reproducible runs for simulation experiments, test suites, and challenge modes.
 */
export class SeededRNG {
  private s: number;

  constructor(seed: number = 42) {
    this.s = seed >>> 0;
  }

  public setSeed(seed: number): void {
    this.s = seed >>> 0;
  }

  /**
   * Returns a pseudo-random float between 0 (inclusive) and 1 (exclusive).
   */
  public next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a pseudo-random integer in [min, max] inclusive.
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a normal-distributed random number with mean and standard deviation (Box-Muller).
   */
  public nextGaussian(mean: number = 0, stdDev: number = 1): number {
    const u1 = Math.max(1e-7, this.next());
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Returns true with given probability [0, 1].
   */
  public chance(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Pick random element from an array.
   */
  public pick<T>(array: T[]): T {
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }
}

export const globalRNG = new SeededRNG(1337);
