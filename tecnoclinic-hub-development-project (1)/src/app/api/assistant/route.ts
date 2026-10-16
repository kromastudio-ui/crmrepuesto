import { NextResponse } from "next/server";
import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { appointments, customers, vehicles } from "@/db/schema";
import { answerCustomerQuestion } from "@/lib/assistant-engine";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      customerName?: string;
      booking?: {
        name?: string;
        phone?: string;
        email?: string;
        service?: string;
        startsAt?: string;
        plate?: string;
        vehicle?: string;
        make?: string;
        model?: string;
        year?: number | null;
        notes?: string;
      };
    };

    if (body.booking) {
      const { name, phone, service, startsAt, email, notes, vehicle, make, model, plate, year } = body.booking;
      const date = startsAt ? new Date(startsAt) : null;
      if (!name?.trim() || !phone?.trim() || !service?.trim() || !date || Number.isNaN(date.getTime())) {
        return NextResponse.json({ error: "Para reservar necesito nombre, teléfono, servicio y fecha/hora." }, { status: 400 });
      }
      if (date.getTime() < Date.now() - 60_000) {
        return NextResponse.json({ error: "La fecha de la cita debe ser futura." }, { status: 400 });
      }

      const hourParts = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Caracas", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
      const localTime = hourParts.find((part) => part.type === "hour")?.value ?? "00";
      const localMinute = hourParts.find((part) => part.type === "minute")?.value ?? "00";
      const hour = Number(localTime);
      const minute = Number(localMinute);
      const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "America/Caracas", weekday: "short" }).format(date);
      const totalMinutes = hour * 60 + minute;
      const closingMinutes = weekday === "Sat" ? 13 * 60 : 17 * 60;
      const openingMinutes = 8 * 60;
      if (weekday === "Sun" || totalMinutes < openingMinutes || totalMinutes + 60 > closingMinutes) {
        return NextResponse.json({ error: "Ese horario está fuera de atención. Abrimos lunes a viernes de 8:00 a. m. a 5:00 p. m. y sábado hasta la 1:00 p. m." }, { status: 422 });
      }

      const startOfSlot = new Date(date.getTime() - 60 * 60 * 1000);
      const endOfSlot = new Date(date.getTime() + 60 * 60 * 1000);
      const conflict = await db
        .select({ id: appointments.id })
        .from(appointments)
        .where(and(gte(appointments.startsAt, startOfSlot), lt(appointments.startsAt, endOfSlot)))
        .limit(1);
      if (conflict.length) {
        return NextResponse.json({ error: "Ese horario ya tiene una cita. Elige otra hora y revisamos la disponibilidad." }, { status: 409 });
      }

      let customer = (await db.select().from(customers).where(eq(customers.phone, phone.trim())).limit(1))[0];
      if (!customer) {
        customer = (
          await db.insert(customers).values({ name: name.trim(), phone: phone.trim(), email: email?.trim() || null }).returning()
        )[0];
      }

      let vehicleId: number | null = null;
      const normalizedPlate = plate?.trim().toUpperCase();
      if (normalizedPlate) {
        const foundVehicle = (await db.select().from(vehicles).where(eq(vehicles.plate, normalizedPlate)).limit(1))[0];
        if (foundVehicle) vehicleId = foundVehicle.id;
        else if (make?.trim() && model?.trim()) {
          const [createdVehicle] = await db.insert(vehicles).values({ customerId: customer.id, make: make.trim(), model: model.trim(), year: year ?? null, plate: normalizedPlate }).returning({ id: vehicles.id });
          vehicleId = createdVehicle.id;
        }
      }

      const [appointment] = await db
        .insert(appointments)
        .values({
          customerId: customer.id,
          vehicleId,
          service: service.trim(),
          startsAt: date,
          durationMinutes: 60,
          status: "confirmada",
          notes: [notes, vehicle ? `Vehículo: ${vehicle}` : ""].filter(Boolean).join(" · ") || null,
          assignedTo: "Asistente IA",
        })
        .returning({ id: appointments.id });

      const time = new Intl.DateTimeFormat("es-VE", {
        timeZone: "America/Caracas",
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
      return NextResponse.json({
        reply: `¡Listo, ${name.trim().split(" ")[0]}! Tu cita para ${service.trim()} quedó registrada para el ${time} en Maripérez. Te esperamos. 🚘`,
        appointmentId: appointment.id,
      }, { status: 201 });
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) return NextResponse.json({ error: "Escribe una consulta para el asistente." }, { status: 400 });
    const reply = await answerCustomerQuestion(message, body.customerName);
    const hasLlmKey = Boolean(process.env.LLM_ROUTER_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
    return NextResponse.json({ reply, provider: hasLlmKey ? "llm-router" : "asistente-local" });
  } catch (error) {
    console.error("Error en el asistente IA:", error);
    return NextResponse.json({ error: "El asistente no está disponible en este momento." }, { status: 500 });
  }
}
