/**
 * Application port for the current time. Implemented by infrastructure; injected so use
 * cases and view models never read the system clock directly.
 */
export interface Clock {
  now(): Date;
}
