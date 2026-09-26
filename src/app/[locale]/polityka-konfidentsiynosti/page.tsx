import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { business } from "@content/business";
import type { Locale } from "@content/types";
import { PageHeader } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo/metadata";
import { crumb } from "@/lib/seo/urls";

export async function generateMetadata({ params }: PageProps<"/[locale]/polityka-konfidentsiynosti">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "privacy" });
  return pageMetadata({ locale, href: "/polityka-konfidentsiynosti", title: t("metaTitle"), description: t("metaDescription") });
}

// Plain-language policy. Have it reviewed against the owner's actual data practices before launch.
const body = {
  uk: [
    ["Які дані ми збираємо", "Коли ви бронюєте номер, столик чи залишаєте запит на банкет, ми отримуємо ваше ім'я, номер телефону, email (якщо ви його вказали), дати, кількість гостей і ваш коментар."],
    ["Навіщо", "Лише щоб опрацювати заявку: зателефонувати вам, підтвердити бронювання і, якщо ви вказали email, надіслати підтвердження. Ми не надсилаємо реклами і не продаємо дані третім особам."],
    ["Хто має доступ", "Адміністратори Козацького Стану. Для сповіщень персоналу ми використовуємо Telegram, для листів — сервіс Resend; сайт розміщено на Vercel, база даних — у хмарному PostgreSQL."],
    ["Як довго зберігаємо", "Дані заявок зберігаються до 3 років для історії бронювань, після чого видаляються."],
    ["Ваші права", `Ви можете попросити показати, виправити або видалити ваші дані — зателефонуйте ${business.phones[0].display}.`],
  ],
  en: [
    ["What we collect", "When you book a room or a table, or send a banquet request, we receive your name, phone number, email (if given), dates, number of guests and your comment."],
    ["Why", "Only to handle your request: to call you, confirm the booking and, if you gave an email, send a confirmation. We don't send marketing and never sell data to third parties."],
    ["Who can see it", "Kozatskyi Stan's administrators. Staff notifications go through Telegram and emails through Resend; the site is hosted on Vercel and the database on a managed PostgreSQL service."],
    ["How long we keep it", "Booking data is kept for up to 3 years as booking history and then deleted."],
    ["Your rights", `You can ask us to show, correct or delete your data — call ${business.phones[0].e164}.`],
  ],
} as const;

export default async function PrivacyPage({ params }: PageProps<"/[locale]/polityka-konfidentsiynosti">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "privacy" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  return (
    <>
      <PageHeader
        locale={locale}
        title={t("metaTitle")}
        crumbs={[crumb("/", locale, tn("home")), crumb("/polityka-konfidentsiynosti", locale, t("metaTitle"))]}
      />
      <article className="container-page prose-ks max-w-3xl py-10">
        {body[locale].map(([h, p]) => (
          <section key={h}>
            <h2 className="text-pine-900">{h}</h2>
            <p>{p}</p>
          </section>
        ))}
      </article>
    </>
  );
}
