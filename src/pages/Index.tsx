import React, { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { PromptInput } from "@/components/PromptInput";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Cpu, Cloud, Lock, Zap } from "lucide-react";

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [configType, setConfigType] = useState("terraform");
  const [showGenerator, setShowGenerator] = useState(false);
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

    setIsLoading(true);
    // TODO: Integrate with actual AI service
    // For now, we'll simulate a response
    setTimeout(() => {
      let sampleCode = "";
      switch (configType) {
        case "docker":
          sampleCode = `FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`;
          break;
        case "kubernetes":
          sampleCode = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sample-app
  template:
    metadata:
      labels:
        app: sample-app
    spec:
      containers:
      - name: sample-app
        image: sample-app:latest
        ports:
        - containerPort: 3000`;
          break;
        default:
          sampleCode = `# Generated Terraform configuration for: ${prompt}
      
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "Main VPC"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  
  tags = {
    Name = "Public Subnet"
  }
}`;
      }
      setCode(sampleCode);
      setIsLoading(false);
      toast({
        title: "Infrastructure code generated",
        description: "Review the generated code and make any necessary adjustments.",
      });
    }, 2000);
  };

  if (!showGenerator) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            AI-Powered Infrastructure as Code
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate, validate, and optimize your infrastructure code using advanced AI. Support for Terraform, Kubernetes, Docker, and more.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="p-6 bg-secondary/50 rounded-lg">
              <Cpu className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Smart Generation</h3>
              <p className="text-sm text-muted-foreground">Generate IaC from natural language descriptions</p>
            </div>
            <div className="p-6 bg-secondary/50 rounded-lg">
              <Cloud className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Multi-Cloud</h3>
              <p className="text-sm text-muted-foreground">Support for all major cloud providers</p>
            </div>
            <div className="p-6 bg-secondary/50 rounded-lg">
              <Lock className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Security First</h3>
              <p className="text-sm text-muted-foreground">Built-in security and compliance checks</p>
            </div>
            <div className="p-6 bg-secondary/50 rounded-lg">
              <Zap className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Instant Deploy</h3>
              <p className="text-sm text-muted-foreground">Deploy your infrastructure in minutes</p>
            </div>
          </div>

          <Button 
            size="lg" 
            className="mt-12"
            onClick={() => setShowGenerator(true)}
          >
            <MessageSquarePlus className="mr-2" />
            Start Generating IaC
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Infrastructure Generator</h1>
          <p className="text-muted-foreground">
            Generate Infrastructure as Code using natural language descriptions
          </p>
        </div>

        <PromptInput
          value={prompt}
          onChange={setPrompt}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />

        <div className="h-[600px]">
          <CodeEditor code={code} onChange={setCode} />
        </div>
      </div>
    </div>
  );
};

export default Index;