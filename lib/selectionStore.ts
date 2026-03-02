/**
 * Временное хранилище выбранных координат с карты.
 * Используется при переходе map-picker → форма создания/редактирования.
 */

export interface MapSelection {
  lat: number;
  lng: number;
}

let selection: MapSelection | null = null;

export function setMapSelection(lat: number, lng: number): void {
  selection = { lat, lng };
}

export function getAndClearMapSelection(): MapSelection | null {
  const s = selection;
  selection = null;
  return s;
}
