export function nameNormalizer(name: string): string {
  name = name.replace(/\s*\([^)]*\)/g, '');
  name = name.trim();
  name = name
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
  
  return name;
}