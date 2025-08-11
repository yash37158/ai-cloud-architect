import { toast } from "@/hooks/use-toast";
import { getEnvironmentConfig } from "@/config/env";

export interface AIResponse {
  code: string;
  explanation: string;
  securityNotes: string[];
  costEstimate?: string;
}

export interface InfrastructurePrompt {
  description: string;
  configType: string;
  cloudProvider?: string;
  region?: string;
  environment?: string;
}

class AIService {
  private config = getEnvironmentConfig();

  private async makeRequest(prompt: string, configType: string): Promise<AIResponse> {
    const provider = import.meta.env.VITE_AI_PROVIDER || 'openai';
    
    if (provider === 'gemini') {
      return this.makeGeminiRequest(prompt, configType);
    } else {
      return this.makeOpenAIRequest(prompt, configType);
    }
  }

  private async makeGeminiRequest(prompt: string, configType: string): Promise<AIResponse> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    const systemPrompt = this.buildSystemPrompt(configType);
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: parseInt(import.meta.env.VITE_MAX_TOKENS || '4000'),
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return this.parseAIResponse(generatedText);
    } catch (error) {
      if (this.config.enableDebug) {
        console.error('Gemini request failed:', error);
      }
      throw new Error('Failed to generate infrastructure code with Gemini. Please check your API key and try again.');
    }
  }

  private async makeOpenAIRequest(prompt: string, configType: string): Promise<AIResponse> {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
    }

    const systemPrompt = this.buildSystemPrompt(configType);
    const userPrompt = this.buildUserPrompt(prompt, configType);

    try {
      const response = await fetch(`${this.config.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: this.config.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data.choices[0]?.message?.content || '');
    } catch (error) {
      if (this.config.enableDebug) {
        console.error('AI request failed:', error);
      }
      throw new Error('Failed to generate infrastructure code. Please check your API key and try again.');
    }
  }

  private buildSystemPrompt(configType: string): string {
    const basePrompt = `You are an expert DevOps engineer and Infrastructure as Code specialist. 
    Generate production-ready, secure, and best-practice infrastructure code based on user requirements.
    
    Always include:
    - Proper error handling and validation
    - Security best practices
    - Cost optimization recommendations
    - Clear documentation and comments
    - Following industry standards and conventions
    
    Format your response as JSON with the following structure:
    {
      "code": "the actual infrastructure code",
      "explanation": "brief explanation of what was generated",
      "securityNotes": ["security considerations"],
      "costEstimate": "estimated monthly cost range"
    }`;

    switch (configType) {
      case 'terraform':
        return `${basePrompt}
        
        For Terraform:
        - Use latest provider versions
        - Include proper variable definitions
        - Add data sources where appropriate
        - Include outputs for important resources
        - Use consistent naming conventions
        - Add proper tags and labels`;
      
      case 'kubernetes':
        return `${basePrompt}
        
        For Kubernetes:
        - Use latest API versions
        - Include resource limits and requests
        - Add proper labels and selectors
        - Include health checks and probes
        - Use ConfigMaps and Secrets appropriately
        - Follow RBAC best practices`;
      
      case 'docker':
        return `${basePrompt}
        
        For Docker:
        - Use multi-stage builds where appropriate
        - Optimize layer caching
        - Include health checks
        - Use non-root users
        - Minimize image size
        - Include proper documentation`;
      
      case 'cloudformation':
        return `${basePrompt}
        
        For CloudFormation:
        - Use latest template version
        - Include proper parameter validation
        - Add outputs for important resources
        - Use intrinsic functions appropriately
        - Include proper error handling
        - Follow AWS best practices`;
      
      case 'ansible':
        return `${basePrompt}
        
        For Ansible:
        - Use proper variable definitions
        - Include error handling
        - Add proper documentation
        - Use roles and playbooks appropriately
        - Include proper validation
        - Follow Ansible best practices`;
      
      default:
        return basePrompt;
    }
  }

  private buildUserPrompt(prompt: string, configType: string): string {
    return `Generate ${configType} infrastructure code for the following requirement:
    
    "${prompt}"
    
    Please provide a complete, production-ready solution that follows best practices for ${configType}.`;
  }

  private parseAIResponse(content: string): AIResponse {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      return {
        code: parsed.code || content,
        explanation: parsed.explanation || 'Generated infrastructure code',
        securityNotes: parsed.securityNotes || ['Review security configuration'],
        costEstimate: parsed.costEstimate || 'Cost estimate not available'
      };
    } catch {
      // If JSON parsing fails, treat the entire content as code
      return {
        code: content,
        explanation: 'Generated infrastructure code from AI',
        securityNotes: ['Please review security configuration manually'],
        costEstimate: 'Cost estimate not available'
      };
    }
  }

  async generateInfrastructureCode(prompt: string, configType: string): Promise<AIResponse> {
    return this.makeRequest(prompt, configType);
  }

  async generateWorkflowCode(workflowType: string, techStack: string): Promise<AIResponse> {
    const prompt = `Generate a GitHub Actions workflow for ${workflowType} pipeline using ${techStack}. 
    Include proper error handling, caching, and best practices.`;
    
    return this.makeRequest(prompt, 'github-actions');
  }

  // Method to check if API key is configured
  isConfigured(): boolean {
    return !!this.config.openaiApiKey;
  }

  // Method to get configuration status
  getConfigStatus() {
    return {
      hasApiKey: !!this.config.openaiApiKey,
      baseUrl: this.config.openaiBaseUrl,
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      debugMode: this.config.enableDebug,
    };
  }
}

export const aiService = new AIService();
