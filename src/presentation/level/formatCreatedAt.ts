/**
 * Pure: renders an ISO timestamp as its `YYYY-MM-DD` date part. Returns the raw input when
 * it is not an ISO date-time string (defensive against unexpected shapes).
 */
export function formatCreatedAt(iso: string): string {
  const separatorIndex = iso.indexOf("T");
  return separatorIndex === -1 ? iso : iso.slice(0, separatorIndex);
}
