/**
 * Utility to sanitize data before sending to Cloud Firestore.
 * 
 * Cloud Firestore strictly prohibits `undefined` values in any document field or nested structure,
 * which causes runtime exceptions such as:
 * "FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined"
 * 
 * This recursive function removes all undefined keys and sanitizes NaN values.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }

  // Handle Numbers (guard against NaN)
  if (typeof data === 'number') {
    if (isNaN(data)) {
      return 0 as unknown as T;
    }
    return data;
  }

  // Handle Objects
  if (typeof data === 'object') {
    // Preserve Date objects
    if (data instanceof Date) {
      return data;
    }

    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }

  // Primitives (string, boolean, etc.)
  return data;
}
