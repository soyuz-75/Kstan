import { business } from "@content/business";
import { getRoom } from "@content/rooms";
import { venues } from "@content/venues";
import type { EventInquiryInput, HotelBookingInput, TableReservationInput } from "../booking/validation";
import { sendEmail, staffRecipients } from "./email";
import { escapeHtml, sendTelegram } from "./telegram";

export type BookingNotice =
  | { kind: "hotel"; ref: string; data: HotelBookingInput }
  | { kind: "table"; ref: string; data: TableReservationInput }
  | { kind: "event"; ref: string; data: EventInquiryInput };

const eventTypeUk: Record<EventInquiryInput["eventType"], string> = {
  wedding: "Весілля",
  birthday: "День народження / ювілей",
  corporate: "Корпоратив",
  christening: "Хрестини",
  other: "Інше",
};
const areaUk: Record<TableReservationInput["area"], string> = {
  any: "Будь-де",
  hall: "Зала",
  gazebo: "Альтанка",
  house: "Хата",
  terrace: "Тераса",
};

/** Staff-facing summary lines, always in Ukrainian. */
export function staffLines(n: BookingNotice): { title: string; lines: [string, string][] } {
  const contact: [string, string][] = [
    ["Ім'я", n.data.name],
    ["Телефон", n.data.phone],
    ...(n.data.email ? ([["Email", n.data.email]] as [string, string][]) : []),
    ["Мова сайту", n.data.locale.toUpperCase()],
    ...(n.data.comment ? ([["Коментар", n.data.comment]] as [string, string][]) : []),
  ];
  switch (n.kind) {
    case "hotel":
      return {
        title: `🛏 Нова заявка на номер ${n.ref}`,
        lines: [
          ["Номер", getRoom(n.data.roomType)?.name.uk ?? n.data.roomType],
          ["Заїзд", n.data.checkIn],
          ["Виїзд", n.data.checkOut],
          ["Гості", `${n.data.adults} дор.${n.data.children ? ` + ${n.data.children} діт.` : ""}`],
          ...contact,
        ],
      };
    case "table":
      return {
        title: `🍽 Бронь столика ${n.ref}`,
        lines: [
          ["Дата", n.data.date],
          ["Час", n.data.time],
          ["Гостей", String(n.data.partySize)],
          ["Місце", areaUk[n.data.area]],
          ...contact,
        ],
      };
    case "event":
      return {
        title: `🎉 Запит на банкет ${n.ref}`,
        lines: [
          ["Подія", eventTypeUk[n.data.eventType]],
          ["Дата", n.data.date],
          ["Гостей", String(n.data.guests)],
          ["Зала", n.data.venue ? (venues.find((v) => v.id === n.data.venue)?.name.uk ?? n.data.venue) : "Без побажань"],
          ...(n.data.budget ? ([["Бюджет", n.data.budget]] as [string, string][]) : []),
          ...contact,
        ],
      };
  }
}

const guestCopy = {
  uk: {
    subject: (ref: string) => `Ваша заявка ${ref} отримана — ${business.name.uk}`,
    body: (ref: string) =>
      `Дякуємо! Ми отримали вашу заявку ${ref}. Адміністратор зателефонує вам найближчим часом, щоб підтвердити деталі.\n\nЯкщо потрібно щось змінити, телефонуйте: ${business.phones.map((p) => p.display).join(", ")}.`,
  },
  en: {
    subject: (ref: string) => `We received your request ${ref} — ${business.name.en}`,
    body: (ref: string) =>
      `Thank you! We received your request ${ref}. Our administrator will call you shortly to confirm the details.\n\nTo change anything, call us: ${business.phones.map((p) => p.e164).join(", ")}.`,
  },
};

function linesToHtml(lines: [string, string][]): string {
  return lines.map(([k, v]) => `<b>${escapeHtml(k)}:</b> ${escapeHtml(v)}`).join("\n");
}

/**
 * Tells staff about a new request (Telegram + email) and, when the guest left
 * an email, confirms receipt to them. Each channel fails independently so one
 * outage never hides a booking — the row is already in the database.
 */
export async function notifyNewBooking(n: BookingNotice): Promise<void> {
  const { title, lines } = staffLines(n);
  const text = `${title}\n\n${lines.map(([k, v]) => `${k}: ${v}`).join("\n")}`;
  const html = `<b>${escapeHtml(title)}</b>\n\n${linesToHtml(lines)}`;

  const tasks: Promise<void>[] = [
    sendTelegram(html),
    sendEmail({
      to: staffRecipients(),
      subject: title.replace(/^\S+\s/, ""),
      text,
      html: `<h2>${escapeHtml(title)}</h2><p>${linesToHtml(lines).replace(/\n/g, "<br>")}</p>`,
      replyTo: n.data.email,
    }),
  ];

  if (n.data.email) {
    const copy = guestCopy[n.data.locale];
    const body = copy.body(n.ref);
    tasks.push(
      sendEmail({
        to: [n.data.email],
        subject: copy.subject(n.ref),
        text: body,
        html: `<p>${escapeHtml(body).replace(/\n/g, "<br>")}</p>`,
      }),
    );
  }

  const results = await Promise.allSettled(tasks);
  for (const r of results) if (r.status === "rejected") console.error("[notify] channel failed", r.reason);
}
