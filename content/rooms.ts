import type { ImageKey } from "./images";
import type { L10n } from "./types";

/**
 * Bookable room types. This file seeds the `room_types` table (`pnpm db:seed`);
 * the database is authoritative for availability, this file for page copy.
 * Details come from the legacy /gotel/ and /kotedzhni-budinochki/ pages and the
 * hotels3d.com listing.
 *
 * CONFIRM with staff before launch:
 *  - `unitsCount` for standard rooms (the legacy site never states it);
 *  - current prices (legacy site: 250 грн/доба for standard rooms, hotels3d.com
 *    "від 300 грн", so the site says "від 300 грн"; houses 1000 / 600 / 400 грн);
 *  - numbering of the 600 грн house (legacy site: №17, hotels3d.com: VIP №18).
 */
export type RoomType = {
  slug: string;
  name: L10n;
  short: L10n;
  description: L10n;
  capacity: number;
  unitsCount: number;
  /** Price per night in UAH. */
  basePrice: number;
  /** When true the price is shown as "від …" / "from …". */
  priceFrom: boolean;
  extras?: L10n;
  amenities: AmenityKey[];
  image: ImageKey;
  kind: "room" | "house";
};

export const amenityLabels = {
  doubleBed: { uk: "Двоспальне ліжко", en: "Double bed" },
  twoBedrooms: { uk: "Дві окремі спальні", en: "Two separate bedrooms" },
  sofaBed: { uk: "Розкладний шкіряний диван", en: "Leather sofa bed" },
  ensuite: { uk: "Санвузол з душовою кабіною", en: "Shower room" },
  sauna: { uk: "Власна сауна", en: "Private sauna" },
  tv: { uk: "Телевізор", en: "TV" },
  phone: { uk: "Телефон", en: "Telephone" },
  kettle: { uk: "Електрочайник, чай і кава", en: "Kettle, tea and coffee" },
  fridge: { uk: "Холодильник", en: "Fridge" },
  microwave: { uk: "Мікрохвильова піч", en: "Microwave" },
  aircon: { uk: "Кондиціонер", en: "Air conditioning" },
  balcony: { uk: "Балкон", en: "Balcony" },
  lounge: { uk: "Вітальня з м'яким куточком", en: "Living room with a sofa" },
  robes: { uk: "Махрові халати й рушники", en: "Bathrobes and towels" },
  hotWater: { uk: "Гаряча і холодна вода 24/7", en: "Hot and cold water 24/7" },
  roomService: { uk: "Їжа з ресторану в номер", en: "Room service from the restaurant" },
  housekeeping: { uk: "Виклик покоївки", en: "Housekeeping on call" },
  parking: { uk: "Охоронювана парковка", en: "Guarded parking" },
} satisfies Record<string, L10n>;

export type AmenityKey = keyof typeof amenityLabels;

const service: AmenityKey[] = ["hotWater", "roomService", "housekeeping", "parking"];
const houseBase: AmenityKey[] = ["lounge", "tv", "fridge", "microwave", "kettle", "ensuite"];

export const rooms: RoomType[] = [
  {
    slug: "standartnyi-nomer",
    kind: "room",
    name: { uk: "Стандартний номер", en: "Standard room" },
    short: {
      uk: "Номер на двох з двоспальним ліжком і душем.",
      en: "A room for two with a double bed and a shower.",
    },
    description: {
      uk: "Затишний номер на двох: двоспальне ліжко, санвузол з душовою кабіною, телевізор, телефон і електрочайник. Гаряча і холодна вода цілодобово, виклик покоївки і страви з ресторану просто в номер. Готель працює цілодобово, територія під відеоспостереженням.",
      en: "A cosy room for two: double bed, shower room, TV, telephone and kettle. Hot and cold water around the clock, housekeeping on call and dishes from the restaurant served in your room. The hotel is open 24/7 and the grounds are under video surveillance.",
    },
    capacity: 2,
    unitsCount: 8,
    basePrice: 300,
    priceFrom: true,
    amenities: ["doubleBed", "ensuite", "tv", "phone", "kettle", ...service],
    image: "roomStandard",
  },
  {
    slug: "vip-budynok-22",
    kind: "house",
    name: { uk: "VIP-будинок №22 з сауною", en: "VIP house №22 with sauna" },
    short: {
      uk: "Двоповерховий будинок на 4–6 гостей: дві спальні та власна сауна.",
      en: "A two-storey house for 4–6 guests with two bedrooms and a private sauna.",
    },
    description: {
      uk: "Перший поверх — вітальня з меблями з дерева ручної роботи і шкіряним м'яким куточком, телевізор, холодильник, мікрохвильова піч, чай і кава. Санвузол з душовою кабіною, власна сауна, махрові халати й рушники. На другому поверсі — дві окремі спальні з двоспальними ліжками, телевізором, кондиціонером і балконом у ліс.",
      en: "Downstairs: a living room with handmade wooden furniture and a leather sofa, TV, fridge, microwave, tea and coffee. A shower room, private sauna, bathrobes and towels. Upstairs: two separate bedrooms, each with a double bed, TV, air conditioning and a balcony over the forest.",
    },
    capacity: 6,
    unitsCount: 1,
    basePrice: 1000,
    priceFrom: false,
    extras: { uk: "Сауна — +200 грн", en: "Sauna — +200 UAH" },
    amenities: ["twoBedrooms", "sauna", ...houseBase, "aircon", "balcony", "robes", ...service],
    image: "vipHouse22",
  },
  {
    slug: "vip-budynok-18",
    kind: "house",
    name: { uk: "VIP-будинок №18", en: "VIP house №18" },
    short: {
      uk: "Двоповерховий будинок на 4–6 гостей зі стінами з колод.",
      en: "A two-storey log house for 4–6 guests.",
    },
    description: {
      uk: "Перший поверх — вітальня з меблями з дерева ручної роботи і шкіряним м'яким куточком, телевізор, холодильник, мікрохвильова піч, чай і кава, санвузол з душовою кабіною. На другому поверсі — спальня з двоспальним ліжком, розкладним шкіряним диваном і телевізором.",
      en: "Downstairs: a living room with handmade wooden furniture and a leather sofa, TV, fridge, microwave, tea and coffee, and a shower room. Upstairs: a bedroom with a double bed, a leather sofa bed and a TV.",
    },
    capacity: 6,
    unitsCount: 1,
    basePrice: 600,
    priceFrom: false,
    amenities: ["doubleBed", "sofaBed", ...houseBase, ...service],
    image: "vipHouse18",
  },
  {
    slug: "vip-budynok-malyi",
    kind: "house",
    name: { uk: "Малі VIP-будинки", en: "Small VIP houses" },
    short: {
      uk: "Двоповерхові будиночки для 2–4 гостей.",
      en: "Two-storey cottages for 2–4 guests.",
    },
    description: {
      uk: "Внизу — м'який куточок, телевізор, холодильник, мікрохвильова піч, чай і кава, санвузол з душовою кабіною. Нагорі — спальня з двоспальним ліжком. Опалення і кондиціонер, внутрішній телефон, виклик покоївки та замовлення їжі з ресторану.",
      en: "Downstairs: a sofa corner, TV, fridge, microwave, tea and coffee, and a shower room. Upstairs: a bedroom with a double bed. Heating and air conditioning, an internal phone, housekeeping on call and food from the restaurant.",
    },
    capacity: 4,
    unitsCount: 2,
    basePrice: 400,
    priceFrom: false,
    amenities: ["doubleBed", ...houseBase, "aircon", "phone", ...service],
    image: "vipHouseSmall",
  },
];

export function getRoom(slug: string): RoomType | undefined {
  return rooms.find((r) => r.slug === slug);
}
