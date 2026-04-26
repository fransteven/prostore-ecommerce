// app/api/schedule/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // El agente enviará un array con las fechas y objetivos (R1, R2, R3)
    const body = await request.json();
    const { sessions } = body;

    // Autenticación Server-to-Server
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // Reemplazar saltos de línea escapados (común en variables de entorno)
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Ejecución paralela para agendar T+2, T+10 y T+30
    const results = await Promise.all(
      sessions.map(async (session: { date: string, topic: string }) => {
        const response = await calendar.events.insert({
          calendarId: process.env.GOOGLE_CALENDAR_ID, // Tu correo personal
          requestBody: {
            summary: `📚 Recuperación Prostore: ${session.topic}`,
            description: 'Práctica de recuperación activa. Refiérete a la base de datos de Notion para las preguntas clave.',
            start: { date: session.date, timeZone: 'America/Bogota' },
            end: { date: session.date, timeZone: 'America/Bogota' },
          },
        });
        return response.data.htmlLink;
      })
    );

    return NextResponse.json({ success: true, events: results });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Fallo en integración de calendario' }, { status: 500 });
  }
}
