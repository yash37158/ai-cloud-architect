import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function AISettings() {
  const { toast } = useToast();
  const [token, setToken] = React.useState("");

  React.useEffect(() => {
    const saved = localStorage.getItem("hf_api_token") || "";
    setToken(saved);
  }, []);

  const save = () => {
    localStorage.setItem("hf_api_token", token.trim());
    toast({ title: "Saved", description: "Hugging Face token stored locally." });
  };

  const clear = () => {
    localStorage.removeItem("hf_api_token");
    setToken("");
    toast({ title: "Removed", description: "Token cleared from this browser." });
  };

  return (
    <Card className="p-4 bg-secondary/50 space-y-3">
      <div className="space-y-2">
        <Label htmlFor="hf-token">Hugging Face API Token (free)</Label>
        <Input
          id="hf-token"
          type="password"
          placeholder="hf_..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          We use this token in-browser to call a free model on Hugging Face Inference. Not sent to our servers.
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={save}>Save Token</Button>
        <Button size="sm" variant="outline" onClick={clear}>Remove</Button>
      </div>
    </Card>
  );
}
