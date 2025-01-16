import { toast } from "@/hooks/use-toast";

// This should be your GitHub OAuth App's client ID
const GITHUB_CLIENT_ID = "your_github_client_id";
const REDIRECT_URI = `${window.location.origin}/auth/callback`;

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  email: string;
}

export const githubAuth = {
  login: () => {
    try {
      const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: "repo read:org workflow",
        state: crypto.randomUUID(),
      });

      window.location.href = `https://github.com/login/oauth/authorize?${params}`;
    } catch (error) {
      console.error("GitHub auth error:", error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to GitHub. Please check your internet connection and try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  handleCallback: async (code: string): Promise<GitHubUser> => {
    try {
      // In a real implementation, this would call your backend
      // which would exchange the code for an access token
      console.log("Handling GitHub callback with code:", code);
      
      // Simulated user data for demo
      return {
        login: "demo_user",
        avatar_url: "https://github.com/github.png",
        name: "Demo User",
        email: "demo@example.com",
      };
    } catch (error) {
      console.error("GitHub auth error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate with GitHub. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },
};