import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.25.76";

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/([a-z0-9-]+\.)*lovable\.app$/i,
  /^https:\/\/([a-z0-9-]+\.)*lovableproject\.com$/i,
  /^http:\/\/localhost(:\d+)?$/i,
];
const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "null",
    Vary: "Origin",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(40),
  context: z.string().max(20000).optional(),
  mode: z.enum(["chat", "summary"]).optional().default("chat"),
});

const SYSTEM_PROMPT = `Você é o "Assistente PsiGestão", um assistente de IA especializado em ajudar psicólogos(as) a gerenciar a prática clínica.

Você ajuda com:
- Análise de relatórios financeiros (receitas, despesas, sessões, tendências)
- Respostas sobre dados de pacientes, agenda e tarefas
- Sugestões de ações (cobranças, retenção, organização)
- Redação de textos clínicos e administrativos

Diretrizes:
- Responda SEMPRE em português do Brasil.
- Seja conciso, objetivo e use markdown (listas, negrito, tabelas curtas) quando ajudar.
- Use os DADOS DE CONTEXTO fornecidos como fonte primária. Se a informação não estiver no contexto, diga isso.
- Nunca invente números. Cite valores com formato R$ X.XXX,XX quando aplicável.
- Para resumos financeiros, estruture em: Visão geral, Destaques, Pontos de atenção, Recomendações.`;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY ausente" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Entrada inválida", details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { messages, context, mode } = parsed.data;

    const systemContent =
      SYSTEM_PROMPT +
      (context ? `\n\n=== DADOS DE CONTEXTO ===\n${context}\n=== FIM DO CONTEXTO ===` : "") +
      (mode === "summary"
        ? "\n\nO usuário pediu um RESUMO COMPLETO do período. Produza um resumo executivo bem estruturado em markdown."
        : "");

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemContent }, ...messages],
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 500;
      const message =
        upstream.status === 429
          ? "Muitas requisições. Aguarde alguns segundos."
          : upstream.status === 402
          ? "Créditos de IA esgotados. Adicione créditos no painel Lovable."
          : `Erro do provedor de IA: ${text.slice(0, 300)}`;
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await upstream.json();
    const reply: string = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
