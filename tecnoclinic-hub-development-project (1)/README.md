# TecnoClinic Hub

CRM y tablero operativo de Tecnoclinic Repuestos (@tecnoclinicrepuestos), Maripérez, Caracas.

## Inicio local

1. Copia `.env.example` a `.env` y configura `DATABASE_URL`.
2. Instala dependencias con `npm install`.
3. Aplica el esquema PostgreSQL: `npx drizzle-kit push`.
4. Ejecuta `npm run dev` y abre `http://localhost:3000`.

Al cargar el tablero por primera vez se crean registros de ejemplo de clientes, vehículos, órdenes, citas, inventario y conversaciones. El seed no reemplaza datos si ya existe un cliente.

## Autenticación del equipo

Auth.js acepta correo y contraseña con el proveedor Credentials. El usuario inicial se crea solo si se configuran `ADMIN_EMAIL` y `ADMIN_PASSWORD`; la contraseña se almacena con bcrypt y el rol es `admin`. Usa `AUTH_SECRET` (o `NEXTAUTH_SECRET`) con un valor aleatorio fuerte. Los roles previstos son `admin` y `advisor` (Técnico / Asesor).

## Asistente IA

El asistente usa el inventario y la agenda de PostgreSQL. Puede conectarse a un endpoint OpenAI-compatible usando `LLM_ROUTER_API_KEY`, `LLM_ROUTER_BASE_URL` y `LLM_ROUTER_MODEL`. También reconoce `OPENROUTER_API_KEY` y `OPENAI_API_KEY`. Sin una clave responde con reglas locales y disponibilidad real del catálogo.

La automatización **Asistente IA en WhatsApp** se activa desde Configuración. El asistente solicita los datos que faltan y registra una cita solo cuando recibe los campos requeridos y el horario está disponible.

## WhatsApp

La integración usa Baileys (WhatsApp Web no oficial). Inicia la conexión desde **Bandeja WhatsApp → Conectar WhatsApp**, escanea el QR y conserva el directorio indicado por `WHATSAPP_AUTH_DIR` en almacenamiento persistente. El proceso Node debe permanecer activo para recibir mensajes y reconectar automáticamente. La sesión de WhatsApp queda vinculada al dispositivo; úsala únicamente con autorización y de acuerdo con las políticas aplicables.

El webhook interno recibe `POST /api/webhooks/whatsapp` con `phone`, `text` y, opcionalmente, `name`, `fromMe`, `externalId` y `timestamp`. Si configuras `WHATSAPP_WEBHOOK_TOKEN`, envía el mismo valor en la cabecera `x-webhook-token`.

## Zona horaria

La agenda, los mensajes y las fechas del taller utilizan `America/Caracas`.
