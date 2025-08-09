
import { aiGenerateIaC } from "@/services/aiGenerator";
import { generateInfrastructureCode as fallbackGenerator } from "@/utils/infrastructureUtils";

// AI-first generator with safe fallback to local templates
export async function generateInfrastructureCodeSmart(prompt: string, configType: string): Promise<string> {
  console.log(`Starting smart generation for ${configType} with prompt: "${prompt}"`);
  
  // Try AI first (requires HF token in localStorage)
  const ai = await aiGenerateIaC(prompt, configType);
  if (ai && ai.trim().length > 10) { // Ensure we have substantial content
    console.log("Successfully generated code using AI");
    return ai;
  }

  console.log("AI generation failed or returned insufficient content, falling back to templates");
  
  // Fallback to existing heuristic/template-based generator
  const fallbackResult = fallbackGenerator(prompt, configType);
  console.log("Using fallback template generator");
  
  return fallbackResult;
}
