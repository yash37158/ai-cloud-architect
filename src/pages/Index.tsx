
import React, { useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import { useToast } from "@/hooks/use-toast";
import { GitHubConfig } from "@/components/GitHubConfig";
import { WorkflowConfig } from "@/components/WorkflowConfig";
import { generateInfrastructureCode } from "@/utils/infrastructureUtils";
import { configService } from "@/services/configService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Terminal,
  MessageSquarePlus,
  Github,
  Cpu,
  Cloud,
  Lock,
  Zap,
  Code2,
  GitBranch,
  Workflow,
  Shield,
  DollarSign,
  Download,
  Copy,
  CheckCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import { GeneratedOutput } from "@/components/GeneratedOutput";

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [configType, setConfigType] = useState("terraform");
  const [showGenerator, setShowGenerator] = useState(false);
  
  // GitHub configuration state
  const [organization, setOrganization] = useState("");
  const [repository, setRepository] = useState("");
  const [workflowType, setWorkflowType] = useState("");
  const [workflowContent, setWorkflowContent] = useState("");
  
  // AI generation result state
  const [generationResult, setGenerationResult] = useState<{
    code: string;
    explanation: string;
    securityNotes: string[];
    costEstimate?: string;
  } | null>(null);
  
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe your infrastructure needs to generate IaC",
        variant: "destructive",
      });
      return;
    }

    const apiKey = configService.getApiKey();
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description:
          "Please configure your OpenAI API key to generate infrastructure code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateInfrastructureCode(prompt, configType);
      setGenerationResult(result);
      toast({
        title: "Infrastructure code generated",
        description: result.explanation,
      });
    } catch (error) {
      toast({
        title: "Error generating code",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while generating the infrastructure code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWorkflow = () => {
    if (!organization || !repository || !workflowContent) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Workflow saved",
      description: "Your GitHub workflow has been saved successfully.",
    });
  };

  const handleTestWorkflow = () => {
    if (!workflowContent) {
      toast({
        title: "No workflow content",
        description: "Please enter workflow configuration first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Testing workflow",
      description: "Your workflow is being validated...",
    });
  };

  if (!showGenerator) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border/40 backdrop-blur-sm fixed w-full z-50 top-0">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <Terminal className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">IaCGPT</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <a href="#features" className="text-foreground/60 hover:text-foreground transition-colors">Features</a>
              <a href="#benefits" className="text-foreground/60 hover:text-foreground transition-colors">Benefits</a>
              <a href="#examples" className="text-foreground/60 hover:text-foreground transition-colors">Examples</a>
              <Button variant="secondary" size="sm" onClick={() => setShowGenerator(true)}>
                Launch App
              </Button>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="pt-24 pb-12">
            <div className="container flex flex-col items-center text-center space-y-8">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent max-w-3xl leading-tight">
                AI-Powered Infrastructure as Code Generator
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Transform natural language into production-ready infrastructure code. Support for Terraform, Kubernetes, Docker, and more.
              </p>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => setShowGenerator(true)}>
                  <MessageSquarePlus className="mr-2" />
                  Start Generating
                </Button>
                <Button size="lg" variant="outline">
                  <Github className="mr-2" />
                  View on GitHub
                </Button>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section id="features" className="py-20 bg-secondary/20">
            <div className="container">
              <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/50">
                  <Cpu className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Smart Generation</h3>
                  <p className="text-sm text-muted-foreground">Generate IaC from natural language descriptions</p>
                </div>
                <div className="p-6 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/50">
                  <Cloud className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Multi-Cloud</h3>
                  <p className="text-sm text-muted-foreground">Support for all major cloud providers</p>
                </div>
                <div className="p-6 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/50">
                  <Lock className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Security First</h3>
                  <p className="text-sm text-muted-foreground">Built-in security and compliance checks</p>
                </div>
                <div className="p-6 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/50">
                  <Zap className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Instant Deploy</h3>
                  <p className="text-sm text-muted-foreground">Deploy your infrastructure in minutes</p>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section id="benefits" className="py-20">
            <div className="container">
              <h2 className="text-3xl font-bold text-center mb-12">Why Choose IaCGPT?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <Code2 className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-semibold">Code Quality</h3>
                  <p className="text-muted-foreground">Generate high-quality, maintainable infrastructure code following best practices.</p>
                </div>
                <div className="space-y-4">
                  <Workflow className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-semibold">Workflow Integration</h3>
                  <p className="text-muted-foreground">Seamlessly integrate with your existing CI/CD pipelines and development workflow.</p>
                </div>
                <div className="space-y-4">
                  <GitBranch className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-semibold">Version Control</h3>
                  <p className="text-muted-foreground">Built-in support for version control and collaboration features.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Examples Section */}
          <section id="examples" className="py-20 bg-secondary/20">
            <div className="container">
              <h2 className="text-3xl font-bold text-center mb-12">See It In Action</h2>
              <div className="max-w-3xl mx-auto p-6 bg-background rounded-lg border border-border/50">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Input:</p>
                  <div className="p-4 bg-secondary rounded-md">
                    "Create a highly available web application on AWS with auto-scaling"
                  </div>
                  <p className="text-sm text-muted-foreground">Generated Terraform:</p>
                  <pre className="p-4 bg-secondary rounded-md overflow-x-auto">
                    <code>{`resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "Main VPC"
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Simple footer with attribution */}
        <footer className="border-t border-border/40 py-4 text-center text-sm text-muted-foreground">
          Made by Yash Sharma
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Generating infrastructure code...
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Infrastructure & Workflow Generator
          </h1>
          <p className="text-muted-foreground">
            Generate Infrastructure as Code and GitHub Workflows using AI
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              configType={configType}
              onConfigTypeChange={setConfigType}
            />

            <GitHubConfig
              organization={organization}
              onOrganizationChange={setOrganization}
              repository={repository}
              onRepositoryChange={setRepository}
              workflowType={workflowType}
              onWorkflowTypeChange={setWorkflowType}
            />

            {/* AIConfig removed */}
          </div>

          <WorkflowConfig
            workflowContent={workflowContent}
            onWorkflowContentChange={setWorkflowContent}
            onSaveWorkflow={handleSaveWorkflow}
            onTestWorkflow={handleTestWorkflow}
          />
        </div>

        {generationResult && (
          <GeneratedOutput result={generationResult} configType={configType} />
        )}

        {/* Removed legacy CodeEditor box */}
        {/* <div className="h-[600px]">
          <CodeEditor code={code} onChange={setCode} />
        </div> */}

        <div className="text-center text-sm text-muted-foreground pt-4">
          Made by Yash Sharma
        </div>
      </div>
    </div>
  );
};

export default Index;
