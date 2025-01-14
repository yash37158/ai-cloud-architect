import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Github, GitBranch, Workflow } from "lucide-react";

interface GitHubConfigProps {
  organization: string;
  onOrganizationChange: (value: string) => void;
  repository: string;
  onRepositoryChange: (value: string) => void;
  workflowType: string;
  onWorkflowTypeChange: (value: string) => void;
}

export function GitHubConfig({
  organization,
  onOrganizationChange,
  repository,
  onRepositoryChange,
  workflowType,
  onWorkflowTypeChange,
}: GitHubConfigProps) {
  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org">Organization</Label>
          <div className="flex gap-2">
            <Input
              id="org"
              placeholder="Enter GitHub organization"
              value={organization}
              onChange={(e) => onOrganizationChange(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <GitBranch className="mr-2 h-4 w-4" />
              Verify
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="repo">Repository</Label>
          <Input
            id="repo"
            placeholder="Enter repository name"
            value={repository}
            onChange={(e) => onRepositoryChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workflow">Workflow Type</Label>
          <Select value={workflowType} onValueChange={onWorkflowTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select workflow type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ci">CI Pipeline</SelectItem>
              <SelectItem value="cd">CD Pipeline</SelectItem>
              <SelectItem value="infrastructure">Infrastructure Deployment</SelectItem>
              <SelectItem value="security">Security Scanning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}