export interface Env {
	NVIDIA_API_KEY: string;
}

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODELO = 'meta/llama-3.1-8b-instruct';

const OPCIONES_PUNTAJE: Record<string, number> = {
	A: 100,
	B: 50,
	C: 25,
	D: 0,
};

const NIVELES_INDICADOR = [
	{ nivel: 'estable', min: 75, max: 100 },
	{ nivel: 'observacion', min: 50, max: 74 },
	{ nivel: 'seguimiento', min: 25, max: 49 },
	{ nivel: 'prioritario', min: 0, max: 24 },
];

function calcularNivel(puntuacion: number): string {
	const nivel = NIVELES_INDICADOR.find((n) => puntuacion >= n.min && puntuacion <= n.max);
	return nivel?.nivel ?? 'observacion';
}

function calcularPuntuacionArea(respuestas: any[]): number {
	if (respuestas.length === 0) return 50;
	const total = respuestas.reduce((acc: number, r: any) => acc + (OPCIONES_PUNTAJE[r.opcion_seleccionada] ?? 25), 0);
	return Math.round(total / respuestas.length);
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		if (request.method !== 'POST') {
			return new Response(JSON.stringify({ error: 'Solo se acepta POST' }), {
				status: 405,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		try {
			const body = (await request.json()) as {
				situaciones: any[];
				respuestas: any[];
				grado: string;
			};

			const { situaciones, respuestas, grado } = body;

			if (!situaciones || !respuestas) {
				return new Response(JSON.stringify({ error: 'situaciones y respuestas son requeridos' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// 1. Agrupar respuestas por área
			const respuestasPorArea: Record<string, any[]> = {
				escolar: [],
				familiar: [],
				personal: [],
				social: [],
				afectiva: [],
			};

			for (const situacion of situaciones) {
				const respuesta = respuestas.find((r: any) => r.situacion_id === situacion.id);
				if (respuesta) {
					respuestasPorArea[situacion.area].push({
						...respuesta,
						situacion,
					});
				}
			}

			// 2. Calcular puntuación por área
			const indicadoresPorArea: Record<string, { puntuacion: number; nivel: string }> = {};
			let puntuacionTotal = 0;
			let areasConRespuesta = 0;

			for (const [area, respuestasArea] of Object.entries(respuestasPorArea)) {
				if (respuestasArea.length > 0) {
					const puntuacion = calcularPuntuacionArea(respuestasArea);
					const nivel = calcularNivel(puntuacion);
					indicadoresPorArea[area] = { puntuacion, nivel };
					puntuacionTotal += puntuacion;
					areasConRespuesta++;
				}
			}

			const puntuacionGeneral = areasConRespuesta > 0 ? Math.round(puntuacionTotal / areasConRespuesta) : 50;
			const nivelGeneral = calcularNivel(puntuacionGeneral);

			// 3. Construir contexto para la IA
			const contextoPorArea = Object.entries(respuestasPorArea)
				.filter(([, respuestasArea]) => respuestasArea.length > 0)
				.map(([area, respuestasArea]) => {
					const detalles = respuestasArea
						.map((r: any) => {
							const opciones: Record<string, string> = {
								A: r.situacion.opcion_a,
								B: r.situacion.opcion_b,
								C: r.situacion.opcion_c,
								D: r.situacion.opcion_d,
							};
							return `Situación: "${r.situacion.contexto}"
Respuesta (${r.opcion_seleccionada}): "${opciones[r.opcion_seleccionada]}"
Tiempo: ${r.tiempo_respuesta_segundos}s`;
						})
						.join('\n\n');

					return `ÁREA ${area.toUpperCase()} (${indicadoresPorArea[area].puntuacion}/100 - ${indicadoresPorArea[area].nivel}):
${detalles}`;
				})
				.join('\n\n---\n\n');

			// 4. Llamar a NVIDIA
			const promptSistema = `Eres un psicólogo educativo experto en bienestar emocional estudiantil. 
Analizas respuestas de estudiantes a situaciones hipotéticas.
Tus análisis son confidenciales, solo para docentes y orientadores.
Escribes en español, de forma clara, empática y profesional.
Nunca mencionas al estudiante por nombre.`;

			const promptUsuario = `Analiza las respuestas de un estudiante de ${grado ?? 'secundaria'} y genera un resumen para el docente orientador.

INDICADORES:
${Object.entries(indicadoresPorArea)
	.map(([area, datos]) => `- ${area}: ${datos.puntuacion}/100 (${datos.nivel})`)
	.join('\n')}
- Bienestar general: ${puntuacionGeneral}/100 (${nivelGeneral})

RESPUESTAS:
${contextoPorArea}

Genera un resumen conciso (máximo 100 palabras) que:
1. Identifique áreas de mayor preocupación
2. Destaque aspectos positivos si los hay
3. Sugiera al docente qué apoyo podría ser útil
4. Use lenguaje profesional pero accesible
No incluyas diagnósticos clínicos.`;

			const nvidiaResponse = await fetch(NVIDIA_API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
				},
				body: JSON.stringify({
					model: MODELO,
					messages: [
						{ role: 'system', content: promptSistema },
						{ role: 'user', content: promptUsuario },
					],
					temperature: 0.3,
					top_p: 1,
					max_tokens: 300,
					stream: false,
				}),
			});

			if (!nvidiaResponse.ok) {
				const errorText = await nvidiaResponse.text();
				return new Response(JSON.stringify({ error: `NVIDIA error: ${nvidiaResponse.status}`, details: errorText }), {
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			const nvidiaData = (await nvidiaResponse.json()) as any;
			const resumenIA = nvidiaData.choices?.[0]?.message?.content ?? '';

			return new Response(
				JSON.stringify({
					indicadoresPorArea,
					nivelGeneral,
					puntuacionGeneral,
					resumenIA,
				}),
				{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
			);
		} catch (error: any) {
			return new Response(JSON.stringify({ error: error.message || 'Error interno' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}
	},
};
