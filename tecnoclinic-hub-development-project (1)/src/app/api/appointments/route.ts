import { NextResponse } from "next/server";
import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { appointments, customers, vehicles } from "@/db/schema";
import { getDashboardData } from "@/lib/app-data";

export const runtime = "nodejs";
const TIME_ZONE = "America/Caracas";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json({ appointments: data.appointments });
  } catch (error) {
    console.error("Error cargando citas:", error);
    return NextResponse.json({ error: "No fue posible cargar las citas." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const service = typeof body.service === "string" ? body.service.trim() : "";
    const startsAt = typeof body.startsAt === "string" ? new Date(body.startsAt) : null;
    if (!name || !phone || !service || !startsAt || Number.isNaN(startsAt.getTime())) {
      return NextResponse.json({ error: "Completa cliente, teléfono, servicio y fecha de la cita." }, { status: 400 });
    }
    if (startsAt.getTime() < Date.now() - 60_000) {
      return NextResponse.json({ error: "La cita debe tener una fecha futura." }, { status: 422 });
    }

    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(startsAt);
    const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "short" }).format(startsAt);
    const durationMinutes = typeof body.durationMinutes === "number" ? Math.max(30, Math.min(240, body.durationMinutes)) : 60;
    const startsAtMinutes = hour * 60 + minute;
    const closingTime = weekday === "Sat" ? 13 * 60 : 17 * 60;
    if (weekday === "Sun" || startsAtMinutes < 8 * 60 || startsAtMinutes + durationMinutes > closingTime) {
      return NextResponse.json({ error: "Ese horario está fuera de atención. Abrimos de lunes a viernes de 8:00 a. m. a 5:00 p. m. y los sábados hasta la 1:00 p. m." }, { status: 422 });
    }

    const collisionStart = new Date(startsAt.getTime() - durationMinutes * 60_000);
    const collisionEnd = new Date(startsAt.getTime() + durationMinutes * 60_000);
    const collision = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(and(gte(appointments.startsAt, collisionStart), lt(appointments.startsAt, collisionEnd)))
      .limit(1);
    if (collision.length) {
      return NextResponse.json({ error: "Ese horario ya tiene una cita. Prueba con otra hora disponible." }, { status: 409 });
    }

    let customer = (await db.select().from(customers).where(eq(customers.phone, phone)).limit(1))[0];
    if (!customer) {
      customer = (
        await db
          .insert(customers)
          .values({ name, phone, email: typeof body.email === "string" ? body.email : null })
          .returning()
      )[0];
    }

    let vehicleId: number | null = null;
    const plate = typeof body.plate === "string" ? body.plate.trim().toUpperCase() : "";
    if (plate) {
      const existingVehicle = (await db.select().from(vehicles).where(eq(vehicles.plate, plate)).limit(1))[0];
      if (existingVehicle) vehicleId = existingVehicle.id;
      else if (typeof body.make === "string" && typeof body.model === "string" && body.make && body.model) {
        const [newVehicle] = await db
          .insert(vehicles)
          .values({ customerId: customer.id, make: body.make, model: body.model, plate, year: typeof body.year === "number" ? body.year : null })
          .returning();
        vehicleId = newVehicle.id;
      }
    }

    const [created] = await db
      .insert(appointments)
      .values({
        customerId: customer.id,
        vehicleId,
        service,
        startsAt,
        durationMinutes,
        status: "confirmada",
        notes: typeof body.notes === "string" ? body.notes : null,
        assignedTo: typeof body.assignedTo === "string" ? body.assignedTo : "Sin asignar",
      })
      .returning({ id: appointments.id });

    const data = await getDashboardData();
    return NextResponse.json({ appointment: data.appointments.find((appointment) => appointment.id === created.id) }, { status: 201 });
  } catch (error) {
    console.error("Error creando cita:", error);
    return NextResponse.json({ error: "No fue posible agendar la cita." }, { status: 500 });
  }
}
