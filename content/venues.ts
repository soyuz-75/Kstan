import type { L10n } from "./types";

/**
 * Restaurant halls, houses and gazebos (from the legacy /restoran/ and
 * /litniy-maydanchik/ pages). Capacities are seated guests.
 */
export type VenueArea = "hall" | "house" | "gazebo" | "terrace";

export type Venue = {
  id: string;
  name: L10n;
  area: VenueArea;
  capacity: number;
  /** Upper bound when the venue can take more guests standing / with extra tables. */
  capacityMax?: number;
  note?: L10n;
  banquet?: boolean;
};

export const venues: Venue[] = [
  {
    id: "banquet-hall",
    name: { uk: "Банкетна зала", en: "Banquet hall" },
    area: "hall",
    capacity: 130,
    banquet: true,
    note: { uk: "Весілля, ювілеї, корпоративи", en: "Weddings, anniversaries, corporate events" },
  },
  { id: "bar-hall", name: { uk: "Барна зала", en: "Bar hall" }, area: "hall", capacity: 40 },
  {
    id: "svyatkova-khata",
    name: { uk: "Святкова хата", en: "Festive house" },
    area: "house",
    capacity: 40,
    banquet: true,
  },
  {
    id: "kurin",
    name: { uk: "Курінь", en: "Kurin gazebo" },
    area: "gazebo",
    capacity: 30,
    capacityMax: 50,
    note: { uk: "Відкрита альтанка", en: "Open-air gazebo" },
    banquet: true,
  },
  { id: "kaminna-zala", name: { uk: "Камінна зала", en: "Fireplace hall" }, area: "hall", capacity: 20 },
  {
    id: "shevchenkivska-khata",
    name: { uk: "Шевченківська хата", en: "Shevchenko house" },
    area: "house",
    capacity: 18,
  },
  { id: "myslyvska-khata", name: { uk: "Мисливська хата", en: "Hunter's house" }, area: "house", capacity: 14 },
  { id: "rybatska-khata", name: { uk: "Рибацька хата", en: "Fisherman's house" }, area: "house", capacity: 12 },
  {
    id: "closed-houses",
    name: { uk: "Закриті будиночки", en: "Enclosed cottages" },
    area: "house",
    capacity: 10,
    note: { uk: "До 10 гостей", en: "Up to 10 guests" },
  },
  {
    id: "open-gazebos",
    name: { uk: "Відкриті альтанки", en: "Open gazebos" },
    area: "gazebo",
    capacity: 10,
    note: { uk: "На 4, 6 і 10 гостей", en: "For 4, 6 and 10 guests" },
  },
  {
    id: "booths",
    name: { uk: "Кабінки на 2-му поверсі", en: "Upstairs booths" },
    area: "hall",
    capacity: 8,
    note: { uk: "На 6 і 8 гостей", en: "For 6 and 8 guests" },
  },
  { id: "terrace", name: { uk: "Відкрита тераса", en: "Open terrace" }, area: "terrace", capacity: 30 },
];

export const areaLabels: Record<VenueArea, L10n> = {
  hall: { uk: "Зала", en: "Hall" },
  house: { uk: "Хата", en: "House" },
  gazebo: { uk: "Альтанка", en: "Gazebo" },
  terrace: { uk: "Тераса", en: "Terrace" },
};

export const saunaInfo = {
  capacity: { from: 6, to: 8 },
  poolDepthM: 1.5,
  pricePerHour: 180,
  extraGuestPrice: 20,
  includedGuests: 6,
};
