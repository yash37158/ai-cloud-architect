import React from "react";
import { Card } from "@/components/ui/card";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ code, onChange }: CodeEditorProps) {
  return (
    <Card className="h-full bg-secondary/50 overflow-hidden">
      <div className="p-4 h-full">
        <textarea
          className="w-full h-full bg-transparent font-mono text-sm resize-none focus:outline-none"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Generated Infrastructure as Code will appear here..."
        />
      </div>
    </Card>
  );
}