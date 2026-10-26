type BookingNotification = {
  reference: string;
  service: string;
  barber: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
};

export async function notifyTelegramOfBooking(booking: BookingNotification) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { configured: false };

  const lines = [
    "New 2G Barbershop booking",
    `Reference: ${booking.reference}`,
    `Service: ${booking.service}`,
    `Barber: ${booking.barber}`,
    `When: ${booking.date} at ${booking.time}`,
    `Guest: ${booking.customerName}`,
    `Phone: ${booking.customerPhone}`,
  ];
  if (booking.notes) lines.push(`Notes: ${booking.notes}`);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: lines.join("\n") }),
  });

  if (!response.ok) {
    console.error("Telegram booking notification failed", {
      status: response.status,
      body: await response.text(),
    });
  }

  return { configured: true, sent: response.ok };
}
