/**
 * Типы сущностей приложения GoNext
 */

/** Место (Place) — хранилище мест для посещения или уже посещённых */
export interface Place {
  id: number;
  name: string;
  description: string;
  visitlater: boolean;
  liked: boolean;
  lat: number;
  lng: number;
  createdAt: string; // ISO date string
}

/** Место при создании/обновлении (без id и createdAt) */
export interface PlaceInput {
  name: string;
  description: string;
  visitlater: boolean;
  liked: boolean;
  lat: number;
  lng: number;
}

/** Поездка (Trip) — маршрут с датами и списком мест */
export interface Trip {
  id: number;
  title: string;
  description: string;
  startDate: string; // ISO date string
  endDate: string;
  createdAt: string;
  current: boolean;
}

/** Поездка при создании/обновлении */
export interface TripInput {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

/** Место в поездке (TripPlace) — связь поездки с местом + факт посещения */
export interface TripPlace {
  id: number;
  tripId: number;
  placeId: number;
  order: number;
  visited: boolean;
  visitDate: string | null; // ISO date string
  notes: string;
}

/** TripPlace при создании/обновлении */
export interface TripPlaceInput {
  tripId: number;
  placeId: number;
  order?: number;
  visited?: boolean;
  visitDate?: string | null;
  notes?: string;
}

/** Место в поездке с данными самого Place */
export interface TripPlaceWithPlace extends TripPlace {
  place: Place;
}
