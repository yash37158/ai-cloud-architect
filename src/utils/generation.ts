import { aiGenerateIaC } from "@/services/aiGenerator";
import { generateInfrastructureCode as fallbackGenerator } from "@/utils/infrastructureUtils";

// AI-first generator with safe fallback to local templates
export async function generateInfrastructureCodeSmart(prompt: string, configType: string): Promise<string> {
  // Try AI first (requires HF token in localStorage)
  const ai = await aiGenerateIaC(prompt, configType);
  if (ai && ai.trim().length > 0) return ai;

  // Fallback to existing heuristic/template-based generator
  return fallbackGenerator(prompt, configType);
}
