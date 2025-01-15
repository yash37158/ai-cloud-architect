import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthScreenProps {
  onAuth: () => void;
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const { toast } = useToast();

  const handleGithubAuth = () => {
    // In a real app, this would integrate with GitHub OAuth
    toast({
      title: "Authentication Success",
      description: "Successfully authenticated with GitHub",
    });
    onAuth();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please authenticate with GitHub to continue using the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGithubAuth} 
            className="w-full"
            variant="outline"
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}