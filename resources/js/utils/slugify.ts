export function slugifyInput(input: string): string {
  if (!input) return '';
  // normalize: lowercase (do not trim so leading/trailing spaces can be converted while typing)
  let s = input.toLowerCase();
  // replace whitespace with hyphen
  s = s.replace(/\s+/g, '-');
  // replace disallowed characters with hyphen (allow a-z,0-9, hyphen, underscore)
  s = s.replace(/[^a-z0-9\-_]+/g, '-');
  // collapse multiple hyphens/underscores
  s = s.replace(/-+/g, '-');
  s = s.replace(/_+/g, '_');
  // do NOT trim leading/trailing separators so user can type them while editing
  return s;
}

export default function slugify(input: string): string {
  if (!input) return '';
  // normalize: lowercase, trim
  let s = input.trim().toLowerCase();
  // replace whitespace with hyphen
  s = s.replace(/\s+/g, '-');
  // replace disallowed characters with hyphen (allow a-z,0-9, hyphen, underscore)
  s = s.replace(/[^a-z0-9\-_]+/g, '-');
  // collapse multiple hyphens/underscores
  s = s.replace(/-+/g, '-');
  s = s.replace(/_+/g, '_');
  // trim hyphens/underscores from ends
  s = s.replace(/(^[-_]+|[-_]+$)/g, '');
  return s;
}
