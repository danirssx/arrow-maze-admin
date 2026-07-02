import type { Clock } from "@/application/ports/Clock";

/** Adapter over the host clock. */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
