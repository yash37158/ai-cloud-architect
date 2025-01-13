import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Wand2 } from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

export function PromptInput({ value, onChange, onGenerate, isLoading }: PromptInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <Card className="p-4 bg-secondary/50">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          className="flex-1"
          placeholder="Describe your infrastructure needs (e.g., 'Create a 3-tier architecture on AWS')"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button type="submit" disabled={isLoading}>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate
        </Button>
      </form>
    </Card>
  );
}