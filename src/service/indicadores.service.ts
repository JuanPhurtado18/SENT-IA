import { supabase } from "../lib/supabase";

export async function procesarActividad(
  usuarioId: string,
  actividadId: string,
) {
  const { data, error } = await supabase.functions.invoke(
    "calcular-indicadores",
    {
      body: { usuario_id: usuarioId, actividad_id: actividadId },
    },
  );

  if (error) throw error;
  return data;
}
