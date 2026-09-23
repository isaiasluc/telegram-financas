import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";

import { llmIntentSchema, toIntent, type ParsedIntent } from "./intent.js";
import { buildSystemPrompt } from "./system-prompt.js";

const MODEL = "claude-opus-5";

const client = new Anthropic();

export async function parseMessage(text: string, now: Date): Promise<ParsedIntent> {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 2048,
    // Classificação simples: effort baixo mantém custo e latência pequenos por mensagem.
    output_config: { effort: "low", format: betaZodOutputFormat(llmIntentSchema) },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: buildSystemPrompt(now),
    messages: [{ role: "user", content: text }],
  });

  // Recusa ou saída truncada não deve derrubar o fluxo: vira `unknown` e o bot pede
  // esclarecimento ao dono, em vez de perder a mensagem.
  if (response.parsed_output === null) {
    console.warn(`Resposta do LLM sem saída estruturada (stop_reason: ${response.stop_reason})`);
    return { intent: "unknown" };
  }

  return toIntent(response.parsed_output);
}
