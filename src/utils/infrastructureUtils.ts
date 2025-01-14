interface InfrastructureTemplate {
  provider: string;
  resourceType: string;
  configuration: string;
}

const templates: Record<string, InfrastructureTemplate[]> = {
  terraform: [
    {
      provider: "aws",
      resourceType: "vpc",
      configuration: `resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true

  tags = {
    Name = "Main VPC"
  }
}`
    },
    {
      provider: "azure",
      resourceType: "resource_group",
      configuration: `resource "azurerm_resource_group" "main" {
  name     = "example-resources"
  location = "West Europe"

  tags = {
    environment = "Production"
  }
}`
    },
    {
      provider: "gcp",
      resourceType: "vpc",
      configuration: `resource "google_compute_network" "vpc_network" {
  name                    = "vpc-network"
  auto_create_subnetworks = "true"
  routing_mode            = "GLOBAL"
}`
    }
  ],
  docker: [
    {
      provider: "node",
      resourceType: "web",
      configuration: `FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`
    },
    {
      provider: "python",
      resourceType: "api",
      configuration: `FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]`
    }
  ],
  kubernetes: [
    {
      provider: "deployment",
      resourceType: "web",
      configuration: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:latest
        ports:
        - containerPort: 80`
    },
    {
      provider: "service",
      resourceType: "loadbalancer",
      configuration: `apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: web`
    }
  ]
};

export const generateInfrastructureCode = (prompt: string, configType: string): string => {
  // Convert prompt to lowercase for better matching
  const promptLower = prompt.toLowerCase();
  
  // Extract key terms from the prompt
  const terms = promptLower.split(' ').filter(term => 
    term.length > 3 && 
    !['the', 'and', 'for', 'with'].includes(term)
  );

  // Get available templates for the selected config type
  const availableTemplates = templates[configType] || [];
  
  if (availableTemplates.length === 0) {
    return "// No templates available for the selected configuration type";
  }

  // Score each template based on matching terms
  const scoredTemplates = availableTemplates.map(template => {
    let score = 0;
    const templateString = JSON.stringify(template).toLowerCase();
    
    terms.forEach(term => {
      if (templateString.includes(term)) score += 1;
      // Give extra weight to provider matches
      if (template.provider.toLowerCase().includes(term)) score += 2;
      if (template.resourceType.toLowerCase().includes(term)) score += 2;
    });
    
    return { template, score };
  });

  // Sort by score and get the best match
  const bestMatch = scoredTemplates.sort((a, b) => b.score - a.score)[0];

  // If no good matches found, return the first template as default
  if (bestMatch.score === 0) {
    console.log("No exact matches found, using default template");
    return availableTemplates[0].configuration;
  }

  console.log(`Found matching template with score ${bestMatch.score}`);
  return bestMatch.template.configuration;
};

// Add new GitHub workflow templates
const workflowTemplates = {
  ci: `name: CI Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test`,

  cd: `name: CD Pipeline

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to production
      run: echo "Add your deployment steps here"`,

  infrastructure: `name: Infrastructure Deployment

on:
  push:
    branches: [ main ]
    paths:
    - 'infrastructure/**'

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v1
    - name: Terraform Init
      run: terraform init
    - name: Terraform Plan
      run: terraform plan
    - name: Terraform Apply
      run: terraform apply -auto-approve`,

  security: `name: Security Scan

on:
  schedule:
    - cron: '0 0 * * *'
  push:
    branches: [ main ]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Run security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}`
};

export const generateWorkflowTemplate = (type: string): string => {
  return workflowTemplates[type as keyof typeof workflowTemplates] || '';
};
