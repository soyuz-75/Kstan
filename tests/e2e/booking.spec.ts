import { expect, test, type Page } from "@playwright/test";
import { addDays, todayInKyiv } from "../../src/lib/booking/dates";
import { generateRef } from "../../src/lib/booking/ref";
import { roomTypeId, sql } from "./db";

/** Each run uses a unique name prefix so its rows are easy to find and clean up. */
const RUN = `e2e-${Date.now()}`;

test.afterAll(async () => {
  await sql`delete from hotel_bookings where name like ${RUN + "%"}`;
  await sql`delete from table_reservations where name like ${RUN + "%"}`;
  await sql`delete from event_inquiries where name like ${RUN + "%"}`;
  await sql.end();
});

/** The server rejects forms submitted faster than a human could (3 s). */
async function waitMinFillTime(page: Page) {
  await page.waitForTimeout(3_200);
}

async function fillContact(page: Page, name: string, labels: { name: string; phone: string }) {
  await page.getByLabel(labels.name, { exact: true }).fill(name);
  await page.getByLabel(labels.phone, { exact: true }).fill("067 143 88 64");
}

// Far enough ahead that it never collides with real data, spread per test.
const futureDay = (offset: number) => addDays(todayInKyiv(), 200 + offset);

for (const locale of ["uk", "en"] as const) {
  const L =
    locale === "uk"
      ? {
          hotel: "/bronyuvannya/",
          table: "/bronyuvannya/stolyk/",
          event: "/bronyuvannya/banket/",
          thanks: /\/bronyuvannya\/dyakuyemo\/\?ref=/,
          room: "Номер",
          checkIn: "Заїзд",
          checkOut: "Виїзд",
          adults: "Дорослі",
          date: "Дата",
          time: "Час",
          party: "Кількість гостей",
          guests: "Кількість гостей",
          name: "Ім'я",
          phone: "Телефон",
          submit: "Надіслати заявку",
          unavailable: /уже зайнятий/,
        }
      : {
          hotel: "/en/booking/",
          table: "/en/booking/table/",
          event: "/en/booking/event/",
          thanks: /\/en\/booking\/thank-you\/\?ref=/,
          room: "Room",
          checkIn: "Check-in",
          checkOut: "Check-out",
          adults: "Adults",
          date: "Date",
          time: "Time",
          party: "Number of guests",
          guests: "Number of guests",
          name: "Name",
          phone: "Phone",
          submit: "Send request",
          unavailable: /already booked/,
        };
  const offset = locale === "uk" ? 0 : 40;

  test(`[${locale}] hotel booking lands in the database`, async ({ page }) => {
    const name = `${RUN}-hotel-${locale}`;
    await page.goto(`${L.hotel}?room=vip-budynok-18`);
    await expect(page.getByLabel(L.room)).toHaveValue("vip-budynok-18");
    await page.getByLabel(L.checkIn).fill(futureDay(offset));
    await page.getByLabel(L.checkOut).fill(futureDay(offset + 2));
    await page.getByLabel(L.adults).fill("3");
    await fillContact(page, name, L);
    await waitMinFillTime(page);
    await page.getByRole("button", { name: L.submit }).click();

    await expect(page).toHaveURL(L.thanks);
    const ref = (await page.getByTestId("booking-ref").textContent())!.trim();
    expect(ref).toMatch(/^H-/);

    const [row] = await sql`select b.*, b.check_in::text as check_in, b.check_out::text as check_out, r.slug from hotel_bookings b join room_types r on r.id = b.room_type_id where ref = ${ref}`;
    expect(row).toMatchObject({
      name,
      slug: "vip-budynok-18",
      check_in: futureDay(offset),
      check_out: futureDay(offset + 2),
      adults: 3,
      phone: "+380671438864",
      status: "pending",
      locale,
    });
  });

  test(`[${locale}] fully booked dates are rejected`, async ({ page }) => {
    // VIP №22 has a single unit: occupy it, then try to book overlapping dates.
    const id = await roomTypeId("vip-budynok-22");
    await sql`insert into hotel_bookings (ref, room_type_id, check_in, check_out, adults, name, phone, status)
              values (${generateRef("hotel")}, ${id}, ${futureDay(offset + 10)}, ${futureDay(offset + 13)}, 2, ${`${RUN}-blocker`}, '+380671438864', 'confirmed')`;

    await page.goto(`${L.hotel}?room=vip-budynok-22`);
    await page.getByLabel(L.checkIn).fill(futureDay(offset + 11));
    await page.getByLabel(L.checkOut).fill(futureDay(offset + 12));
    await fillContact(page, `${RUN}-hotel-full-${locale}`, L);
    await waitMinFillTime(page);
    await page.getByRole("button", { name: L.submit }).click();

    await expect(page.getByRole("alert").filter({ hasText: L.unavailable })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(L.hotel.replace(/\//g, "\\/")));
    // The guest's input survives the round trip.
    await expect(page.getByLabel(L.checkIn)).toHaveValue(futureDay(offset + 11));
    const rows = await sql`select 1 from hotel_bookings where name = ${`${RUN}-hotel-full-${locale}`}`;
    expect(rows).toHaveLength(0);

    // Check-out day of the blocker is free again.
    await page.getByLabel(L.checkIn).fill(futureDay(offset + 13));
    await page.getByLabel(L.checkOut).fill(futureDay(offset + 14));
    await page.getByRole("button", { name: L.submit }).click();
    await expect(page).toHaveURL(L.thanks);
  });

  test(`[${locale}] table reservation lands in the database`, async ({ page }) => {
    const name = `${RUN}-table-${locale}`;
    await page.goto(L.table);
    await page.getByLabel(L.date, { exact: true }).fill(futureDay(offset + 20));
    await page.getByLabel(L.time).fill("19:30");
    await page.getByLabel(L.party).fill("6");
    await fillContact(page, name, L);
    await waitMinFillTime(page);
    await page.getByRole("button", { name: L.submit }).click();

    await expect(page).toHaveURL(L.thanks);
    const ref = (await page.getByTestId("booking-ref").textContent())!.trim();
    expect(ref).toMatch(/^T-/);
    const [row] = await sql`select *, date::text as date from table_reservations where ref = ${ref}`;
    expect(row).toMatchObject({ name, party_size: 6, time: "19:30:00", date: futureDay(offset + 20), status: "pending" });
  });

  test(`[${locale}] event inquiry lands in the database`, async ({ page }) => {
    const name = `${RUN}-event-${locale}`;
    await page.goto(L.event);
    await page.getByLabel(L.date, { exact: true }).fill(futureDay(offset + 30));
    await page.getByLabel(L.guests).fill("80");
    await fillContact(page, name, L);
    await waitMinFillTime(page);
    await page.getByRole("button", { name: L.submit }).click();

    await expect(page).toHaveURL(L.thanks);
    const ref = (await page.getByTestId("booking-ref").textContent())!.trim();
    expect(ref).toMatch(/^E-/);
    const [row] = await sql`select * from event_inquiries where ref = ${ref}`;
    expect(row).toMatchObject({ name, guests: 80, event_type: "wedding", status: "pending" });
  });
}

test("validation errors are shown next to the fields", async ({ page }) => {
  await page.goto("/bronyuvannya/stolyk/");
  await page.getByLabel("Ім'я", { exact: true }).fill("Я");
  await page.getByLabel("Телефон", { exact: true }).fill("123");
  await waitMinFillTime(page);
  await page.getByRole("button", { name: "Надіслати заявку" }).click();
  await expect(page.getByText("Вкажіть український номер")).toBeVisible();
  await expect(page.getByText("Вкажіть ім'я")).toBeVisible();
  await expect(page.getByLabel("Телефон", { exact: true })).toHaveAttribute("aria-invalid", "true");
});

test("instant submissions are treated as spam", async ({ page }) => {
  await page.goto("/bronyuvannya/stolyk/");
  await page.getByLabel("Дата", { exact: true }).fill(futureDay(90));
  await fillContact(page, `${RUN}-bot`, { name: "Ім'я", phone: "Телефон" });
  await page.getByRole("button", { name: "Надіслати заявку" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Не вдалося надіслати" })).toBeVisible();
  expect(await sql`select 1 from table_reservations where name = ${`${RUN}-bot`}`).toHaveLength(0);
});
