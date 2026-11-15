export const METADATA_LENGTH_LIMITS = {
  title: { min: 15, max: 60 },
  metaDescription: { min: 100, max: 160 }
} as const;

export type MetadataLengthField = keyof typeof METADATA_LENGTH_LIMITS;
export type MetadataLengthStatus = 'missing' | 'short' | 'in-range' | 'long';

export function metadataLengthStatus(field: MetadataLengthField, value: string): MetadataLengthStatus {
  if (!value) return 'missing';
  const { min, max } = METADATA_LENGTH_LIMITS[field];
  if (value.length < min) return 'short';
  if (value.length > max) return 'long';
  return 'in-range';
}
