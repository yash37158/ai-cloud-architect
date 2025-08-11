import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings, 
  Key, 
  Shield, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  FileText,
  Globe
} from "lucide-react";
import { configService } from "@/services/configService";
import { useToast } from "@/hooks/use-toast";

interface AIConfigProps {
  onConfigChange: () => void;
}

export function AIConfig({ onConfigChange }: AIConfigProps) {
  const [config, setConfig] = useState(configService.getConfig());
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const envStatus = configService.getEnvironmentStatus();
  const hasEnvApiKey = configService.hasEnvironmentApiKey();

  useEffect(() => {
    if (hasEnvApiKey) {
      setIsValid(true);
    } else {
      validateApiKey();
    }
  }, [config.openaiApiKey, hasEnvApiKey]);

  const handleConfigChange = (key: keyof typeof config, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    configService.saveConfig(newConfig);
    onConfigChange();
  };

  const validateApiKey = async () => {
    if (!config.openaiApiKey && !hasEnvApiKey) {
      setIsValid(false);
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${config.openaiApiKey || configService.getApiKey()}`,
        },
      });
      
      setIsValid(response.ok);
      if (response.ok) {
        toast({
          title: "API Key Valid",
          description: hasEnvApiKey ? "Environment API key is working correctly" : "Manual API key is working correctly",
        });
      } else {
        toast({
          title: "Invalid API Key",
          description: "Please check your OpenAI API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsValid(false);
      toast({
        title: "Validation Failed",
        description: "Could not validate API key",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          AI Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment API Key Status */}
        {hasEnvApiKey && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Using Environment API Key</span>
            </div>
            <div className="mt-2 text-xs text-green-600 space-y-1">
              <div>Model: {envStatus.model}</div>
              <div>Base URL: {envStatus.baseUrl}</div>
              <div>Max Tokens: {envStatus.maxTokens}</div>
            </div>
          </div>
        )}

        {/* Manual API Key Input (only show if no environment key) */}
        {!hasEnvApiKey && (
          <div className="space-y-2">
            <Label htmlFor="api-key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              OpenAI API Key
            </Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="sk-..."
                value={config.openaiApiKey}
                onChange={(e) => handleConfigChange('openaiApiKey', e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? "Hide" : "Show"}
              </Button>
              <Button 
                variant="outline" 
                onClick={validateApiKey}
                disabled={isValidating || !config.openaiApiKey}
              >
                {isValidating ? "Validating..." : "Validate"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={isValid ? "default" : "destructive"}>
                {isValid ? "Valid" : "Invalid or Missing"}
              </Badge>
            </div>
          </div>
        )}

        {/* Configuration Options */}
        <div className="space-y-2">
          <Label htmlFor="provider">Default Cloud Provider</Label>
          <Select 
            value={config.defaultProvider} 
            onValueChange={(value) => handleConfigChange('defaultProvider', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aws">AWS</SelectItem>
              <SelectItem value="azure">Azure</SelectItem>
              <SelectItem value="gcp">Google Cloud</SelectItem>
              <SelectItem value="digitalocean">DigitalOcean</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Default Region</Label>
          <Select 
            value={config.defaultRegion} 
            onValueChange={(value) => handleConfigChange('defaultRegion', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
              <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
              <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
              <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="cost-estimation" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Enable Cost Estimation
          </Label>
          <Switch
            id="cost-estimation"
            checked={config.enableCostEstimation}
            onCheckedChange={(checked) => handleConfigChange('enableCostEstimation', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="security-scanning" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Enable Security Scanning
          </Label>
          <Switch
            id="security-scanning"
            checked={config.enableSecurityScanning}
            onCheckedChange={(checked) => handleConfigChange('enableSecurityScanning', checked)}
          />
        </div>

        {/* Environment Info */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Globe className="h-4 w-4" />
            Environment Configuration
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Debug Mode: {envStatus.debugMode ? 'Enabled' : 'Disabled'}</div>
            <div>Base URL: {envStatus.baseUrl}</div>
            <div>Model: {envStatus.model}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
