import { business } from "./business";
import type { L10n } from "./types";

export type FaqItem = { q: L10n; a: L10n };

export const hotelFaq: FaqItem[] = [
  {
    q: { uk: "О котрій заїзд і виїзд?", en: "What are the check-in and check-out times?" },
    a: {
      uk: `Заїзд з ${business.hotel.checkIn}, виїзд до ${business.hotel.checkOut}. Мінімальний термін проживання — 1 доба. Якщо потрібен ранній заїзд чи пізній виїзд, зателефонуйте нам — постараємося допомогти.`,
      en: `Check-in is from ${business.hotel.checkIn}, check-out is by ${business.hotel.checkOut}. The minimum stay is one night. Call us if you need an early check-in or late check-out and we'll do our best.`,
    },
  },
  {
    q: { uk: "Чи потрібна передоплата?", en: "Do I need to pay in advance?" },
    a: {
      uk: "Ні. Ви залишаєте заявку на сайті, адміністратор телефонує, щоб підтвердити бронювання. Оплата — на місці.",
      en: "No. You send a request on the website and our administrator calls you to confirm the booking. You pay on arrival.",
    },
  },
  {
    q: { uk: "Чи є парковка?", en: "Is there parking?" },
    a: {
      uk: "Так, безкоштовна парковка на території комплексу.",
      en: "Yes, free parking on the grounds.",
    },
  },
  {
    q: { uk: "Як до вас дістатися?", en: "How do I get there?" },
    a: {
      uk: "Ми за 3 км від Вінниці, біля Вінницької об'їзної, у лісі. Маршрут у Google Maps — на сторінці контактів.",
      en: "We are 3 km from Vinnytsia by the Vinnytsia ring road, in the forest. See the contacts page for a Google Maps route.",
    },
  },
  {
    q: { uk: "Чи можна замовити їжу в номер?", en: "Can I order food to my room?" },
    a: {
      uk: "Так, страви з нашого ресторану принесуть у номер.",
      en: "Yes, dishes from our restaurant can be served in your room.",
    },
  },
];

export const banquetFaq: FaqItem[] = [
  {
    q: { uk: "На скільки гостей розрахована банкетна зала?", en: "How many guests does the banquet hall seat?" },
    a: {
      uk: "Банкетна зала вміщує до 130 гостей. Для менших свят є Святкова хата (40), Курінь (до 50) і камерні хати на 12–18 гостей.",
      en: "The banquet hall seats up to 130 guests. For smaller celebrations there's the Festive house (40), the Kurin gazebo (up to 50) and cosy houses for 12–18 guests.",
    },
  },
  {
    q: { uk: "Чи можна провести виїзну церемонію?", en: "Can we hold an outdoor ceremony?" },
    a: {
      uk: "Так, проводимо виїзні весільні церемонії просто в лісі, біля ставка з фонтаном.",
      en: "Yes, we host outdoor wedding ceremonies in the forest, by the pond with its fountain.",
    },
  },
  {
    q: { uk: "Чи допоможете з ведучим і шоу?", en: "Can you help with an MC and a show?" },
    a: {
      uk: "Так, порекомендуємо ведучого, організуємо піротехнічне шоу, феєрверк і фонтани.",
      en: "Yes, we can recommend an MC and arrange a pyrotechnic show, fireworks and fountains.",
    },
  },
  {
    q: { uk: "Чи можуть гості залишитися на ніч?", en: "Can guests stay overnight?" },
    a: {
      uk: "Так, на території є готель і VIP-будинки — зручно для гостей весілля чи ювілею.",
      en: "Yes, there's a hotel and VIP houses on site — convenient for wedding or anniversary guests.",
    },
  },
];
