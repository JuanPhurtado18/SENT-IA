import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const executionId = crypto.randomUUID();

  console.log(`[${executionId}] INICIO: Solicitud recibida`);
  console.log(`[${executionId}] Método: ${req.method}`);

  // Manejo CORS
  if (req.method === "OPTIONS") {
    console.log(`[${executionId}] CORS: Solicitud OPTIONS`);
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.error(`[${executionId}] ERROR: Método no permitido`);

    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    // ==========================================
    // PASO 1: VERIFICAR VARIABLES DE ENTORNO
    // ==========================================

    console.log(`[${executionId}] PASO 1: Verificando variables`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error(`[${executionId}] ERROR: Faltan variables de entorno`, {
        supabaseUrl: !!supabaseUrl,
        anonKey: !!anonKey,
        serviceRoleKey: !!serviceRoleKey,
      });

      throw new Error("Faltan variables de entorno de Supabase");
    }

    console.log(`[${executionId}] PASO 1 COMPLETADO`);

    // ==========================================
    // PASO 2: VERIFICAR AUTORIZACIÓN
    // ==========================================

    console.log(`[${executionId}] PASO 2: Verificando autorización`);

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      console.error(`[${executionId}] ERROR: No existe Authorization`);

      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    console.log(`[${executionId}] PASO 2 COMPLETADO: Token recibido`);

    // PASO 3: Identificar usuario
    console.log(`[${executionId}] PASO 3: Identificando usuario`);

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    const supabaseUser = createClient(supabaseUrl, anonKey);

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser(token);

    if (userError || !user) {
      console.error(
        `[${executionId}] ERROR PASO 3:`,
        userError?.message || "Usuario no válido",
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Sesión no válida o expirada",
          executionId,
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    console.log(
      `[${executionId}] PASO 3 COMPLETADO: Usuario identificado`,
      user.id,
    );

    // ==========================================
    // PASO 4: CREAR CLIENTE ADMINISTRADOR
    // ==========================================

    console.log(`[${executionId}] PASO 4: Creando cliente administrador`);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log(`[${executionId}] PASO 4 COMPLETADO`);

    // ==========================================
    // PASO 5: ELIMINAR FOTO DE PERFIL
    // ==========================================

    console.log(`[${executionId}] PASO 5: Eliminando fotografía`);

    const { data: fotoEliminada, error: errorFoto } = await admin.storage
      .from("avatars")
      .remove([`${user.id}/avatar.jpg`]);

    if (errorFoto) {
      console.error(
        `[${executionId}] ADVERTENCIA PASO 5: No se pudo eliminar la foto`,
        errorFoto.message,
      );
    } else {
      console.log(
        `[${executionId}] PASO 5 COMPLETADO: Resultado Storage`,
        fotoEliminada,
      );
    }

    // ==========================================
    // PASO 6: ELIMINAR CUENTA DE AUTH
    // ==========================================

    console.log(`[${executionId}] PASO 6: Eliminando usuario de Supabase Auth`);

    const { error: errorEliminar } = await admin.auth.admin.deleteUser(user.id);

    if (errorEliminar) {
      console.error(
        `[${executionId}] ERROR PASO 6: No se pudo eliminar el usuario`,
        errorEliminar,
      );

      throw errorEliminar;
    }

    console.log(
      `[${executionId}] PASO 6 COMPLETADO: Usuario eliminado correctamente`,
    );

    // ==========================================
    // PASO 7: RESPUESTA EXITOSA
    // ==========================================

    console.log(`[${executionId}] PASO 7: ELIMINACIÓN COMPLETADA`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cuenta eliminada correctamente",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`[${executionId}] ERROR GENERAL:`, message);
    console.error(`[${executionId}] DETALLE COMPLETO:`, error);

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        executionId,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
