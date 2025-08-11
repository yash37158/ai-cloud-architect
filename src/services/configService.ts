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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
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
        throw new Error(`Gemini API request failed: ${response.status} - ${response.statusText}`);
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
    const config = this.getConfig();
    return config.aiProvider === 'gemini' ? !!config.geminiApiKey : !!config.openaiApiKey;
  }

  // Method to get configuration status
  getConfigStatus() {
    const config = this.getConfig();
    return {
      hasApiKey: this.isConfigured(),
      baseUrl: this.config.openaiBaseUrl,
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      debugMode: this.config.enableDebug,
    };
  }
}

export const aiService = new AIService();

export interface AppConfig {
  openaiApiKey: string;
  geminiApiKey: string;
  aiProvider: string;
  defaultRegion: string;
  defaultProvider: string;
  enableCostEstimation: boolean;
  enableSecurityScanning: boolean;
}

class ConfigService {
  private configKey = 'ai-cloud-architect-config';

  getConfig(): AppConfig {
    const envConfig = getEnvironmentConfig();
    const stored = localStorage.getItem(this.configKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with environment config, prioritizing env vars
        return {
          ...parsed,
          openaiApiKey: envConfig.openaiApiKey || parsed.openaiApiKey,
          geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || parsed.geminiApiKey,
          aiProvider: import.meta.env.VITE_AI_PROVIDER || parsed.aiProvider,
        };
      } catch {
        return this.getDefaultConfig(envConfig);
      }
    }
    return this.getDefaultConfig(envConfig);
  }

  saveConfig(config: Partial<AppConfig>): void {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(this.configKey, JSON.stringify(updated));
  }

  private getDefaultConfig(envConfig: ReturnType<typeof getEnvironmentConfig>): AppConfig {
    return {
      openaiApiKey: envConfig.openaiApiKey,
      geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      aiProvider: import.meta.env.VITE_AI_PROVIDER || 'openai',
      defaultRegion: 'us-east-1',
      defaultProvider: 'aws',
      enableCostEstimation: true,
      enableSecurityScanning: true,
    };
  }

  getApiKey(): string {
    const config = this.getConfig();
    return config.aiProvider === 'gemini' ? config.geminiApiKey : config.openaiApiKey;
  }

  setApiKey(key: string): void {
    this.saveConfig({ openaiApiKey: key });
  }

  // Check if API key is available from environment
  hasEnvironmentApiKey(): boolean {
    return !!getEnvironmentConfig().openaiApiKey;
  }

  // Get environment configuration status
  getEnvironmentStatus() {
    const envConfig = getEnvironmentConfig();
    return {
      hasApiKey: !!envConfig.openaiApiKey,
      baseUrl: envConfig.openaiBaseUrl,
      model: envConfig.model,
      maxTokens: envConfig.maxTokens,
      debugMode: envConfig.enableDebug,
    };
  }
}

export const configService = new ConfigService();

export interface InfrastructureTemplate {
  provider: string;
  resourceType: string;
  configuration: string;
}

// Keep templates as fallback for offline mode
const templates: Record<string, InfrastructureTemplate[]> = {
  terraform: [
    {
      provider: "aws",
      resourceType: "vpc",
      configuration: `resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true

  tags = {
    Name = "Main VPC"
  }
}`
    },
    {
      provider: "azure",
      resourceType: "resource_group",
      configuration: `resource "azurerm_resource_group" "main" {
  name     = "example-resources"
  location = "West Europe"

  tags = {
    environment = "Production"
  }
}`
    },
    {
      provider: "gcp",
      resourceType: "vpc",
      configuration: `resource "google_compute_network" "vpc_network" {
  name                    = "vpc-network"
  auto_create_subnetworks = "true"
  routing_mode            = "GLOBAL"
}`
    }
  ],
  docker: [
    {
      provider: "node",
      resourceType: "web",
      configuration: `FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`
    },
    {
      provider: "python",
      resourceType: "api",
      configuration: `FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]`
    }
  ],
  kubernetes: [
    {
      provider: "deployment",
      resourceType: "web",
      configuration: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:latest
        ports:
        - containerPort: 80`
    },
    {
      provider: "service",
      resourceType: "loadbalancer",
      configuration: `apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: web`
    }
  ]
};

export const generateInfrastructureCode = async (
  prompt: string, 
  configType: string
): Promise<{ code: string; explanation: string; securityNotes: string[]; costEstimate?: string }> => {
  const apiKey = configService.getApiKey();
  
  if (!apiKey) {
    // Fallback to template-based generation with warning
    return generateFromTemplates(prompt, configType);
  }

  try {
    // Use real AI service
    const result = await aiService.generateInfrastructureCode(prompt, configType);
    return result;
  } catch (error) {
    // Fallback to templates if AI fails
    return generateFromTemplates(prompt, configType);
  }
};

const generateFromTemplates = (
  prompt: string, 
  configType: string
): { code: string; explanation: string; securityNotes: string[]; costEstimate?: string } => {
  const promptLower = prompt.toLowerCase();
  const terms = promptLower.split(' ').filter(term => 
    term.length > 3 && 
    !['the', 'and', 'for', 'with'].includes(term)
  );

  const availableTemplates = templates[configType] || [];
  
  if (availableTemplates.length === 0) {
    return {
      code: "// No templates available for the selected configuration type",
      explanation: "Template not found",
      securityNotes: ["Please configure AI service for better results"]
    };
  }

  const scoredTemplates = availableTemplates.map(template => {
    let score = 0;
    const templateString = JSON.stringify(template).toLowerCase();
    
    terms.forEach(term => {
      if (templateString.includes(term)) score += 1;
      if (template.provider.toLowerCase().includes(term)) score += 2;
      if (template.resourceType.toLowerCase().includes(term)) score += 2;
    });
    
    return { template, score };
  });

  const bestMatch = scoredTemplates.sort((a, b) => b.score - a.score)[0];

  if (bestMatch.score === 0) {
    return {
      code: availableTemplates[0].configuration,
      explanation: "Using default template (no exact matches found)",
      securityNotes: ["Please review and customize the generated code"]
    };
  }

  return {
    code: bestMatch.template.configuration,
    explanation: `Generated from template matching "${bestMatch.template.resourceType}"`,
    securityNotes: ["Please review and customize the generated code"]
  };
};

// Add new GitHub workflow templates
const workflowTemplates = {
  ci: `name: CI Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test`,

  cd: `name: CD Pipeline

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to production
      run: echo "Add your deployment steps here"`,

  infrastructure: `name: Infrastructure Deployment

on:
  push:
    branches: [ main ]
    paths:
    - 'infrastructure/**'

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v1
    - name: Terraform Init
      run: terraform init
    - name: Terraform Plan
      run: terraform plan
    - name: Terraform Apply
      run: terraform apply -auto-approve`,

  security: `name: Security Scan

on:
  schedule:
    - cron: '0 0 * * *'
  push:
    branches: [ main ]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Run security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}`
};

export const generateWorkflowTemplate = (type: string): string => {
  return workflowTemplates[type as keyof typeof workflowTemplates] || '';
};
