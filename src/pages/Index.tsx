import React, { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { PromptInput } from "@/components/PromptInput";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      setCode(`# Generated Terraform configuration for: ${prompt}
      
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
}`);
      setIsLoading(false);
      toast({
        title: "Infrastructure code generated",
        description: "Review the generated code and make any necessary adjustments.",
      });
    }, 2000);
  };

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