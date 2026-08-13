// La URL del Worker de Cloudflare
const CLOUDFLARE_WORKER_URL = "https://nvidia-proxy.sentia2807.workers.dev";

export interface MensajeChat {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function llamarNvidia(
  mensajes: MensajeChat[],
  maxTokens: number = 150,
): Promise<string> {
  console.log("Llamando al Worker de Cloudflare...");

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    console.log("Timeout alcanzado");
    controller.abort();
  }, 55000);

  let response: Response;
  try {
    response = await fetch(CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: mensajes,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (err: any) {
    clearTimeout(timeout);
    console.log("Error llamando al Worker:", err.name, err.message);
    if (err.name === "AbortError") {
      throw new Error("Timeout: El Worker no respondió en 55 segundos");
    }
    throw new Error(`Error de red al llamar al Worker: ${err.message}`);
  }

  console.log("Worker response status:", response.status);

  const responseText = await response.text();
  console.log("Worker response:", responseText.substring(0, 200));

  if (!response.ok) {
    throw new Error(`Error del Worker: ${response.status} - ${responseText}`);
  }

  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Error parseando respuesta del Worker: ${responseText}`);
  }

  if (!data.content) {
    throw new Error(`Worker no devolvió contenido: ${responseText}`);
  }

  return data.content;
}
