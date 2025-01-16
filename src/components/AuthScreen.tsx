import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { githubAuth } from "@/services/githubAuth";

interface AuthScreenProps {
  onAuth: () => void;
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const { toast } = useToast();

  const handleGithubAuth = async () => {
    try {
      githubAuth.login();
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Failed to initiate GitHub authentication",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please authenticate with GitHub to continue using the application.
            This will allow us to manage your repositories and workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGithubAuth} 
            className="w-full"
            variant="outline"
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            We'll only request the permissions needed to manage your repositories and workflows.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}