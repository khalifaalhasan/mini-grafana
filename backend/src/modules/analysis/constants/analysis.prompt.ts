/**
 * Prompt Template untuk Root Cause Analysis (RCA) Log Error.
 * Memisahkan secara tegas antara System Prompt (aturan, persona, format)
 * dan User Prompt (data log yang akan dianalisis).
 */

export interface RcaPromptParams {
  logMessage: string;
  logLabels: Record<string, string>;
  logTimestamp: string;
}

/**
 * System prompt yang menentukan persona, batasan output (STRICT JSON),
 * anti-halusinasi, dan bahasa Indonesia.
 * Dikirim pada field "system" di payload REST API Ollama (/api/generate).
 */
export const RCA_SYSTEM_PROMPT = `You are an expert Site Reliability Engineer (SRE) and DevOps Observability specialist.
Your task is to perform a concise, technical Root Cause Analysis (RCA) on the provided log error.

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY a valid JSON object.
2. Do NOT include any explanations, markdown formatting, code block ticks ('\`\`\`json'), introductory text, or concluding text outside of the JSON object.
3. The JSON object MUST strictly contain the following three keys:
   - "root_cause": A technical explanation of why the error occurred based on the log message and labels.
   - "impact": The potential system, service, or business impact of this error.
   - "recommendation": Actionable, step-by-step remediation or preventative measures to resolve the issue.
4. Do NOT hallucinate files, servers, environment variables, or architectural components that are not explicitly mentioned or reasonably inferred from the log labels and message.
5. All JSON values ("root_cause", "impact", "recommendation") MUST be written in clear, professional Indonesian (Bahasa Indonesia).
6. Keep your analysis factual, concise, and directly grounded in the provided log text.

Example valid response format:
{
  "root_cause": "Kehabisan koneksi pada database connection pool akibat lonjakan request konkuren yang tinggi tanpa konfigurasi timeout.",
  "impact": "Request API yang bergantung pada query database gagal dengan error 500, menyebabkan penurunan performa layanan bagi pengguna akhir.",
  "recommendation": "1. Tingkatkan batas maksimum connection pool pada konfigurasi database. 2. Implementasikan pola timeout dan circuit breaker pada query database."
}`;

/**
 * Membangun user prompt murni yang berisi data log (tanpa system instructions).
 * Dikirim pada field "prompt" di payload REST API Ollama (/api/generate).
 */
export function buildRcaUserPrompt(params: RcaPromptParams): string {
  const formattedLabels = Object.entries(params.logLabels)
    .map(([k, v]) => `${k}="${v}"`)
    .join(', ');

  return `Lakukan Root Cause Analysis (RCA) pada error log berikut dan kembalikan hasil sesuai format JSON yang ditentukan:

---
Timestamp: ${params.logTimestamp}
Labels: {${formattedLabels}}
Message:
${params.logMessage}
---`;
}

/** Alias untuk backward compatibility */
export const buildRcaPrompt = buildRcaUserPrompt;

export interface OllamaRcaPayload {
  model: string;
  system: string;
  prompt: string;
  format: 'json';
  stream: boolean;
  keep_alive: number;
  options: {
    temperature: number;
  };
}

/**
 * Membangun payload lengkap untuk dikirim ke POST /api/generate Ollama.
 * Menggunakan format: "json", zero-temperature, dan keep_alive: 0.
 */
export function buildOllamaRcaPayload(
  model: string,
  params: RcaPromptParams,
): OllamaRcaPayload {
  return {
    model,
    system: RCA_SYSTEM_PROMPT,
    prompt: buildRcaUserPrompt(params),
    format: 'json',
    stream: false,
    keep_alive: 0,
    options: {
      temperature: 0, // Zero-temperature untuk determinisme (Aturan Wohlin)
    },
  };
}
