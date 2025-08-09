// Lightweight AI generator service using Hugging Face Inference API
// Reads token from localStorage key: 'hf_api_token'

export async function aiGenerateIaC(prompt: string, configType: string): Promise<string | null> {
  const apiToken = localStorage.getItem("hf_api_token");
  if (!apiToken) {
    console.log("No HF API token found in localStorage");
    return null; // No token provided, caller should fallback
  }

  // Use a more reliable and widely available model
  const model = "bigcode/starcoder2-3b";

  // Build a simpler, more direct prompt
  const systemPrompt = `Generate ${configType} configuration code for: ${prompt}`;

  try {
    console.log(`Attempting to generate ${configType} code using AI model: ${model}`);
    
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: systemPrompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.2,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false,
        },
        options: { wait_for_model: true },
      }),
    });

    console.log(`API response status: ${res.status}`);

    if (!res.ok) {
      console.log(`API request failed with status: ${res.status}`);
      // Try alternative model if first one fails
      return await tryAlternativeModel(prompt, configType, apiToken);
    }

    const data = await res.json();
    console.log("API response data:", data);

    // Handle different response formats
    let text = "";
    if (Array.isArray(data) && data.length > 0) {
      if (data[0].generated_text) {
        text = data[0].generated_text as string;
      } else if (typeof data[0] === "string") {
        text = data[0];
      }
    } else if (data && typeof data === "object" && "generated_text" in data) {
      text = (data as any).generated_text as string;
    } else if (typeof data === "string") {
      text = data;
    }

    if (!text || text.trim().length === 0) {
      console.log("No valid text generated from AI model");
      return null;
    }

    // Clean up the generated text
    text = cleanGeneratedCode(text, configType);
    console.log("Generated code:", text);
    
    return text;
  } catch (err) {
    console.error("AI generation error:", err);
    // Network or parsing error – let caller fallback
    return null;
  }
}

async function tryAlternativeModel(prompt: string, configType: string, apiToken: string): Promise<string | null> {
  // Try a simpler, more reliable model
  const alternativeModel = "TinyLlama/TinyLlama-1.1B-Chat-v1.0";
  
  try {
    console.log(`Trying alternative model: ${alternativeModel}`);
    
    const res = await fetch(`https://api-inference.huggingface.co/models/${alternativeModel}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `# ${configType} configuration for ${prompt}\n`,
        parameters: {
          max_new_tokens: 350,
          temperature: 0.4,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false,
        },
        options: { wait_for_model: true },
      }),
    });

    if (!res.ok) {
      console.log(`Alternative model also failed with status: ${res.status}`);
      return null;
    }

    const data = await res.json();
    let text = "";
    
    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      text = data[0].generated_text as string;
    }

    if (text) {
      text = cleanGeneratedCode(text, configType);
      console.log("Generated code from alternative model:", text);
      return text;
    }

    return null;
  } catch (err) {
    console.error("Alternative model error:", err);
    return null;
  }
}

function cleanGeneratedCode(text: string, configType: string): string {
  // Remove markdown code fences if present
  let cleaned = text.replace(/```[\s\S]*?\n/, "").replace(/```$/, "");
  
  // Remove the input prompt if it's echoed back
  const lines = cleaned.split('\n');
  const relevantLines = lines.filter(line => {
    const trimmed = line.trim();
    // Keep lines that look like actual code
    return trimmed.length > 0 && 
           !trimmed.startsWith('#') ||
           (configType === 'terraform' && (trimmed.includes('resource') || trimmed.includes('variable') || trimmed.includes('output'))) ||
           (configType === 'kubernetes' && (trimmed.includes('apiVersion') || trimmed.includes('kind') || trimmed.includes('metadata'))) ||
           (configType === 'docker' && (trimmed.includes('FROM') || trimmed.includes('RUN') || trimmed.includes('COPY')));
  });
  
  return relevantLines.join('\n').trim();
}
