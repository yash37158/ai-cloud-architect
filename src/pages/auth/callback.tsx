import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { githubAuth } from "@/services/githubAuth";
import { useToast } from "@/hooks/use-toast";

export default function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      toast({
        title: "Authentication Error",
        description: searchParams.get("error_description") || "Failed to authenticate with GitHub",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    if (code) {
      handleGitHubCallback(code);
    }
  }, [searchParams, navigate]);

  const handleGitHubCallback = async (code: string) => {
    try {
      const user = await githubAuth.handleCallback(code);
      // Store user data in your app's state management system
      console.log("Authenticated user:", user);
      
      toast({
        title: "Authentication Successful",
        description: `Welcome, ${user.name}!`,
      });
      
      navigate("/");
    } catch (error) {
      console.error("Failed to handle GitHub callback:", error);
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Authenticating...</h2>
        <p className="text-muted-foreground">Please wait while we complete your GitHub authentication.</p>
      </div>
    </div>
  );
}