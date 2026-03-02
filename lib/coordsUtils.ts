/**
 * Утилиты для работы с координатами в формате DD (Decimal Degrees)
 * Формат: "широта, долгота" например "19.436376730299216, -99.12967536183893"
 */

export function parseDD(input: string): { lat: number; lng: number } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/,\s*/);
  if (parts.length < 2) return null;
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());
  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export function formatDD(lat: number, lng: number): string {
  return `${lat}, ${lng}`;
}
