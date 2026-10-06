import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "../_shared/cors.ts";

const DOMINIO = "@ietirafaelnaviaron.edu.co";
const INSTITUCION = "Rafael Navia Varon";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, nombreCompleto } = await req.json();

    if (!email.endsWith(DOMINIO)) {
      return new Response(
        JSON.stringify({ error: `Solo se permiten correos ${DOMINIO}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Crear usuario en auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nombre_completo: nombreCompleto,
          role: "docente",
          institucion: INSTITUCION,
        },
      });

    if (authError) throw authError;

    // Actualizar perfil con role docente
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: "docente",
        nombre_completo: nombreCompleto,
        institucion: INSTITUCION,
      })
      .eq("id", authData.user.id);

    if (profileError) throw profileError;

    return new Response(
      JSON.stringify({ success: true, userId: authData.user.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
