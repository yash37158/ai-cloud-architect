import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code2,
  Shield,
  DollarSign,
  Download,
  Copy,
  AlertTriangle,
  Info,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedOutputProps {
  result: {
    code: string;
    explanation: string;
    securityNotes: string[];
    costEstimate?: string;
  } | null;
  configType: string;
}

/* ---------- Helpers to normalize AI output ---------- */
function stripCodeFences(input: string): string {
  const startFence = /^```[\w-]*\s*\n?/;
  const endFence = /\n?```$/;
  let out = input.trim();
  if (startFence.test(out)) out = out.replace(startFence, "");
  if (endFence.test(out)) out = out.replace(endFence, "");
  return out.trim();
}

function tryParseJson<T = any>(s: string): T | null {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function unescapeEscapes(s: string): string {
  // Convert common escape sequences into real characters.
  return s
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function normalizeCode(raw: string): string {
  let code = raw ?? "";

  // If raw itself is a JSON object as string containing { "code": "..." }
  const maybeJson = tryParseJson(code);
  if (maybeJson && typeof (maybeJson as any).code === "string") {
    code = (maybeJson as any).code;
  }

  // Strip markdown code fences like ```json or ```terraform
  code = stripCodeFences(code);

  // If it still looks like a JSON string wrapper containing "code": "...",
  // try once more (some models double-wrap).
  const maybeJson2 = tryParseJson(code);
  if (maybeJson2 && typeof (maybeJson2 as any).code === "string") {
    code = (maybeJson2 as any).code;
  }

  // Unescape \n, \t, \"
  code = unescapeEscapes(code);

  // Final trim
  return code.trim();
}

function buildOutline(code: string, type: string): string[] {
  const lines: string[] = [];
  if (type === "terraform") {
    const r = /resource\s+"([^"]+)"\s+"([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = r.exec(code))) lines.push(`resource ${m[1]}.${m[2]}`);
    const v = /variable\s+"([^"]+)"/g;
    while ((m = v.exec(code))) lines.push(`variable ${m[1]}`);
    const o = /output\s+"([^"]+)"/g;
    while ((m = o.exec(code))) lines.push(`output ${m[1]}`);
  } else if (type === "kubernetes" || type === "cloudformation" || type === "ansible") {
    const kind = /(^|\n)\s*kind:\s*([^\n#]+)/gi;
    let km: RegExpExecArray | null;
    while ((km = kind.exec(code))) lines.push(`kind ${km[2].trim()}`);
    const name = /(^|\n)\s*name:\s*([^\n#]+)/gi;
    let nm: RegExpExecArray | null;
    while ((nm = name.exec(code))) lines.push(`name ${nm[2].trim()}`);
  } else if (type === "docker") {
    code.split("\n").forEach((ln) => {
      const t = ln.trim();
      if (/^FROM\s+/i.test(t)) lines.push(t);
      if (/^EXPOSE\s+/i.test(t)) lines.push(t);
      if (/^CMD\s+/i.test(t)) lines.push(t);
      if (/^ENTRYPOINT\s+/i.test(t)) lines.push(t);
    });
  }
  return lines.slice(0, 25); // keep outline compact
}
/* --------------------------------------------------- */

export function GeneratedOutput({ result, configType }: GeneratedOutputProps) {
  const { toast } = useToast();
  if (!result) return null;

  // Normalize/clean output for readable display
  const formattedCode = normalizeCode(result.code);
  const outlineItems = buildOutline(formattedCode, configType);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: `${type} copied to clipboard` });
    } catch {
      toast({
        title: "Copy failed",
        description: "Unable to copy",
        variant: "destructive",
      });
    }
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download started", description: filename });
  };

  const getFileExtension = () => {
    switch (configType) {
      case "terraform":
        return ".tf";
      case "docker":
        return "Dockerfile";
      case "kubernetes":
        return ".yaml";
      case "cloudformation":
        return ".yaml";
      case "ansible":
        return ".yml";
      default:
        return ".txt";
    }
  };

  const getFileName = () => {
    const ts = new Date().toISOString().slice(0, 10);
    return `infrastructure-${configType}-${ts}${getFileExtension()}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-blue-800">
              <Code2 className="h-4 w-4" />
              Generated Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {configType.charAt(0).toUpperCase() + configType.slice(1)}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {result.explanation || "Infrastructure code generated"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-amber-800">
              <Shield className="h-4 w-4" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-200 text-amber-800">
                {(result.securityNotes || []).length} Notes
              </Badge>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Review security configuration
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-green-800">
              <DollarSign className="h-4 w-4" />
              Cost Estimate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-green-900">
              {result.costEstimate || "Not Available"}
            </div>
            <p className="text-xs text-green-700 mt-1">Monthly estimate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-background border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Generated Infrastructure
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(formattedCode, "Code")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCode(formattedCode, getFileName())}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Code
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="mt-4">
              <div className="relative">
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {configType.toUpperCase()}
                  </Badge>
                </div>
                <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto text-sm font-mono border max-h-[38rem] overflow-y-auto whitespace-pre">
                  <code className="text-foreground">{formattedCode}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold text-amber-700">
                    Security Considerations
                  </span>
                </div>
                {(result.securityNotes || []).map((note, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
                  >
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-amber-800">{note}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Generation Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{configType}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Generated:</span>
                      <span>{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Code Length:</span>
                      <span>{formattedCode.length} chars</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Quick Outline</h4>
                  {outlineItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No outline detected for this configuration type.
                    </p>
                  ) : (
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      {outlineItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
