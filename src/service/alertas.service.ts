import { supabase } from "../lib/supabase";

export async function obtenerAlertas() {
  const { data, error } = await supabase
    .from("alertas")
    .select(
      `
      id,
      tipo,
      descripcion,
      estado,
      created_at,
      profiles!alertas_usuario_id_fkey (
        nombre_completo
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((a: any) => ({
    id: a.id,
    tipo: a.tipo,
    descripcion: a.descripcion,
    estado: a.estado,
    nombreEstudiante: a.profiles?.nombre_completo ?? "Estudiante",
    fecha: new Date(a.created_at).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  }));
}

export async function marcarAlertaRevisada(
  alertaId: string,
  docenteId: string,
) {
  const { error } = await supabase
    .from("alertas")
    .update({
      estado: "revisada",
      revisada_por: docenteId,
      revisada_at: new Date().toISOString(),
    })
    .eq("id", alertaId);

  if (error) throw error;
}

export async function reactivarAlerta(alertaId: string) {
  const { error } = await supabase
    .from("alertas")
    .update({
      estado: "activa",
      revisada_por: null,
      revisada_at: null,
    })
    .eq("id", alertaId);

  if (error) throw error;
}
