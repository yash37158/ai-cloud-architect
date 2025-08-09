// Lightweight AI generator service using Hugging Face Inference API
// Reads token from localStorage key: 'hf_api_token'

export async function aiGenerateIaC(prompt: string, configType: string): Promise<string | null> {
  const apiToken = localStorage.getItem("hf_api_token");
  if (!apiToken) return null; // No token provided, caller should fallback

  // Choose a widely available instruction model suitable for code
  // Feel free to change this model in the UI or here if needed
  const model = "HuggingFaceH4/zephyr-7b-beta";

  // Build a strict prompt to return ONLY code for the requested IaC type
  const system = `You are an expert Infrastructure-as-Code generator.\n` +
    `Output ONLY valid ${configType} code with no explanations, no markdown fences, and no surrounding text.`;

  const user = `Task: Generate ${configType} configuration for the following requirement.\n` +
    `Requirement: ${prompt}\n` +
    `Rules:\n` +
    `- Return only the ${configType} code.\n` +
    `- Keep it minimal but functional.\n` +
    `- Use best practices for ${configType}.`;

  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `${system}\n\n${user}`,
        parameters: {
          max_new_tokens: 600,
          temperature: 0.2,
          return_full_text: false,
        },
      }),
    });

    if (!res.ok) {
      // If the model is loading or rate-limited, let caller fallback
      return null;
    }

    const data = await res.json();
    // Possible shapes:
    // [{ generated_text: string }]
    // { generated_text: string }
    // Or other variations
    let text = "";
    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      text = data[0].generated_text as string;
    } else if (data && typeof data === "object" && "generated_text" in data) {
      text = (data as any).generated_text as string;
    } else if (typeof data === "string") {
      text = data;
    }

    if (!text) return null;

    // Strip markdown code fences if any
    const fenced = text.match(/```[\s\S]*?```/);
    if (fenced && fenced[0]) {
      text = fenced[0].replace(/```[a-zA-Z]*\n?/, "").replace(/```$/, "");
    }

    return text.trim();
  } catch (err) {
    // Network or parsing error – let caller fallback
    return null;
  }
}
