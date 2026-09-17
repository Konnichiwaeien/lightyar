import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { readGiftForm, validGiftFile, MAX_GIFT_FILE_BYTES } from "@/lib/security/gift-upload";
import { wishlistService } from "@/lib/api/services/wishlist";

/**
 * Приём заявки дарителя.
 *
 * Форма отправляется сюда, а не напрямую в Strapi: создание записи требует токена,
 * а он не должен попадать в браузер. Здесь же валидируется файл — публичная загрузка
 * без ограничений по типу и размеру была бы дырой.
 */

const MAX_FILE_BYTES = MAX_GIFT_FILE_BYTES;

// пять заявок за десять минут: живой даритель столько не отправит,
// а скрипт, забивающий хранилище файлами, упрётся сразу
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const strapiBase = () => (process.env.STRAPI_API_URL || "http://localhost:1443/api").replace(/\/api$/, "");

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const token = process.env.STRAPI_GIFT_WRITE_TOKEN;
  if (!token || process.env.GIFT_ORDERS_ENABLED !== "true") {
    console.error("[gift-orders] STRAPI_GIFT_WRITE_TOKEN отсутствует");
    return bad("Приём заявок временно недоступен. Напишите нам, пожалуйста, в сообщения группы.", 503);
  }

  const limit = rateLimit({ key: clientIp(request), limit: RATE_LIMIT, windowMs: RATE_WINDOW_MS });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Слишком много заявок подряд. Попробуйте через несколько минут или напишите нам в сообщения группы." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let form: FormData;
  try {
    form = await readGiftForm(request);
  } catch (error) {
    if (error instanceof Error && error.message === "TOO_LARGE") return bad("Файл больше 8 МБ. Пришлите снимок поменьше.", 413);
    return bad("Не удалось прочитать форму. Попробуйте отправить ещё раз.");
  }

  const donorName = String(form.get("donorName") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const email = String(form.get("email") || "").trim();
  const comment = String(form.get("comment") || "").trim();
  const wishlistItemId = String(form.get("wishlistItemId") || "").trim();
  const consent = form.get("consent");
  const honeypot = String(form.get("website") || "").trim();
  const barcode = form.get("barcode");

  // поле скрыто от людей: если оно заполнено, форму отправил бот.
  // Отвечаем успехом, чтобы не подсказывать ему, что именно распознано.
  if (honeypot) {
    console.warn("[gift-orders] honeypot triggered");
    return NextResponse.json({ ok: true });
  }

  if (donorName.length < 2) return bad("Укажите, как вас зовут.");
  if (donorName.length > 100 || phone.length > 32 || email.length > 254 || comment.length > 2000) return bad("Проверьте длину заполненных полей.");
  if (!/^[a-zA-Z0-9]{1,64}$/.test(wishlistItemId)) return bad("Выберите подарок в списке.");
  if (phone.replace(/\D/g, "").length < 10) return bad("Проверьте номер телефона — в нём не хватает цифр.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("Проверьте адрес почты.");
  if (consent !== "true") return bad("Без согласия на обработку данных мы не сможем принять заявку.");
  if (!(barcode instanceof File) || barcode.size === 0) return bad("Приложите фотографию штрих-кода заказа.");
  if (barcode.size > MAX_FILE_BYTES) return bad("Файл больше 8 МБ. Пришлите снимок поменьше.");
  if (!ALLOWED_TYPES.includes(barcode.type)) return bad("Штрих-код нужен картинкой или PDF.");
  if (!await validGiftFile(barcode)) return bad("Файл не соответствует выбранному формату. Пришлите фотографию или PDF.");
  if (!(await wishlistService.getSettings()).acceptingOrders) return bad("Уточните адрес доставки у приюта перед заказом.", 503);

  const headers = { Authorization: `Bearer ${token}` };

  try {
    // сначала файл: без него заявка бессмысленна, поэтому запись без него не создаём
    const upload = new FormData();
    upload.append("path", "gift-orders");
    upload.append("files", barcode, barcode.name || "barcode");
    const uploaded = await fetch(`${strapiBase()}/api/upload`, { method: "POST", headers, body: upload, signal: AbortSignal.timeout(20000) });
    if (!uploaded.ok) {
      console.error("[gift-orders] upload failed:", uploaded.status);
      return bad("Не удалось сохранить файл. Попробуйте ещё раз или напишите нам.", 502);
    }
    const files = (await uploaded.json()) as { id: number }[];
    const fileId = files?.[0]?.id;
    if (!fileId) return bad("Не удалось сохранить файл. Попробуйте ещё раз.", 502);

    const created = await fetch(`${strapiBase()}/api/gift-orders`, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          donorName,
          phone,
          email: email || undefined,
          comment: comment || undefined,
          barcode: fileId,
          status: "new",
          wishlistItem: wishlistItemId || undefined,
        },
      }),
    });

    if (!created.ok) {
      console.error("[gift-orders] create failed:", created.status);
      return bad("Заявка не сохранилась. Напишите нам, пожалуйста, в сообщения группы.", 502);
    }

    return NextResponse.json({ ok: true });
  } catch {
    console.error("[gift-orders] upstream request failed");
    return bad("Что-то пошло не так на нашей стороне. Напишите нам, пожалуйста, в сообщения группы.", 502);
  }
}
