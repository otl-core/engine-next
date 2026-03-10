/**
 * Vitest global test setup
 */

// Suppress jsdom "Not implemented: navigation" errors triggered by link.click()
// in outbound link detection tests. These are expected — jsdom doesn't support
// real navigation, but our event listeners work correctly.
const originalStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = ((
  chunk: string | Uint8Array,
  encodingOrCallback?: BufferEncoding | ((err?: Error | null) => void),
  callback?: (err?: Error | null) => void,
): boolean => {
  const str = typeof chunk === "string" ? chunk : chunk.toString();
  if (str.includes("Not implemented: navigation")) return true;
  return originalStderrWrite(
    chunk,
    encodingOrCallback as BufferEncoding,
    callback,
  );
}) as typeof process.stderr.write;
