import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkflowConfigProps {
  workflowContent: string;
  onWorkflowContentChange: (value: string) => void;
  onSaveWorkflow: () => void;
  onTestWorkflow: () => void;
}

export function WorkflowConfig({
  workflowContent,
  onWorkflowContentChange,
  onSaveWorkflow,
  onTestWorkflow,
}: WorkflowConfigProps) {
  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Workflow Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select defaultValue="template">
          <SelectTrigger>
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nodejs">Node.js CI/CD</SelectItem>
            <SelectItem value="python">Python CI/CD</SelectItem>
            <SelectItem value="docker">Docker Build</SelectItem>
            <SelectItem value="terraform">Terraform Deploy</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          className="min-h-[300px] font-mono"
          placeholder="Enter workflow YAML configuration"
          value={workflowContent}
          onChange={(e) => onWorkflowContentChange(e.target.value)}
        />

        <div className="flex gap-2">
          <Button onClick={onTestWorkflow} className="flex-1">
            <Play className="mr-2 h-4 w-4" />
            Test Workflow
          </Button>
          <Button onClick={onSaveWorkflow} variant="secondary" className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            Save Workflow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}