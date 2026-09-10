/**
 * Concept #17: Hash-Based Horizontal Sharding
 * Deterministic shard router for student activity logs.
 * Uses djb2 hash algorithm to consistently map studentEmail → shard index.
 */

const SHARD_COUNT = 4;

/**
 * djb2 hash: fast, deterministic, non-cryptographic.
 * Same input always produces the same shard index.
 */
export function getShardForStudent(studentEmail: string): number {
  let hash = 5381;
  for (let i = 0; i < studentEmail.length; i++) {
    hash = (hash << 5) + hash + studentEmail.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash) % SHARD_COUNT;
}

/**
 * Returns the MongoDB collection name for a given student.
 * e.g. "ethan@example.com" → "activity_logs_shard_1"
 */
export function getShardCollection(studentEmail: string): string {
  return `activity_logs_shard_${getShardForStudent(studentEmail)}`;
}

/**
 * Returns all shard collection names (used for cross-shard queries / stats).
 */
export function getAllShardCollections(): string[] {
  return Array.from({ length: SHARD_COUNT }, (_, i) => `activity_logs_shard_${i}`);
}
