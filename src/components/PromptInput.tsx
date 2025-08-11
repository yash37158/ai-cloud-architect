import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Wand2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { configService } from "@/services/configService";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, FileText } from "lucide-react";

interface PromptInputProps {
  value: string;
  configType: string;
  onChange: (value: string) => void;
  onConfigTypeChange: (value: string) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

export function PromptInput({
  value,
  configType,
  onChange,
  onConfigTypeChange,
  onGenerate,
  isLoading
}: PromptInputProps) {
  const hasApiKey = !!configService.getApiKey();
  const hasEnvApiKey = configService.hasEnvironmentApiKey();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <Card className="p-4 bg-secondary/50">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={hasApiKey ? "default" : "destructive"} className="text-xs">
          {hasApiKey ? (
            <>
              {hasEnvApiKey ? (
                <FileText className="h-3 w-3 mr-1" />
              ) : (
                <CheckCircle className="h-3 w-3 mr-1" />
              )}
              {hasEnvApiKey ? "Env Key" : "Manual Key"}
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 mr-1" />
              API Key Required
            </>
          )}
        </Badge>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Select value={configType} onValueChange={onConfigTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="terraform">Terraform</SelectItem>
            <SelectItem value="docker">Dockerfile</SelectItem>
            <SelectItem value="kubernetes">Kubernetes</SelectItem>
            <SelectItem value="cloudformation">CloudFormation</SelectItem>
            <SelectItem value="ansible">Ansible</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="flex-1"
          placeholder="Describe your infrastructure needs (e.g., 'Create a web application with load balancer')"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button type="submit" disabled={isLoading || !hasApiKey}>
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? "Generating..." : "Generate"}
        </Button>
      </form>
    </Card>
  );
}