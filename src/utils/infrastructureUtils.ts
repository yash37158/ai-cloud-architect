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
  const promptLower = prompt.toLowerCase();

  // Fast-path: common web app/dashboard architecture for Terraform
  if (
    configType === 'terraform' && /(dashboard|web app|webapp|frontend|spa)/.test(promptLower)
  ) {
    return `# Personal Finance Dashboard (Serverless) on AWS
# S3 for static frontend, API Gateway + Lambda for backend, DynamoDB for data

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "site" {
  bucket = "personal-finance-dashboard-${'${'}random_id.suffix.hex${'}'}"
  force_destroy = true
  tags = { Project = "personal-finance-dashboard" }
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  index_document { suffix = "index.html" }
  error_document { key = "index.html" }
}

resource "aws_dynamodb_table" "transactions" {
  name         = "pf_transactions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"
  range_key    = "tx_id"

  attribute { name = "user_id" type = "S" }
  attribute { name = "tx_id"  type = "S" }
  tags = { Project = "personal-finance-dashboard" }
}

resource "aws_iam_role" "lambda_exec" {
  name = "pf_lambda_exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "api" {
  function_name = "pf_backend"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  filename      = "function.zip"  # Upload your zipped code
  source_code_hash = filebase64sha256("function.zip")
  environment { variables = { TABLE_NAME = aws_dynamodb_table.transactions.name } }
}

resource "aws_api_gateway_rest_api" "api" {
  name        = "pf-api"
  description = "Personal Finance API"
}

resource "aws_api_gateway_resource" "items" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "transactions"
}

resource "aws_api_gateway_method" "get_items" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.items.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_items" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.items.id
  http_method = aws_api_gateway_method.get_items.http_method
  type        = "AWS_PROXY"
  integration_http_method = "POST"
  uri         = aws_lambda_function.api.invoke_arn
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${'${'}aws_api_gateway_rest_api.api.execution_arn${'}'}/*/*"
}

resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  depends_on  = [aws_api_gateway_integration.get_items]
}

resource "aws_api_gateway_stage" "prod" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.api.id
  stage_name    = "prod"
}

output "website_bucket" {
  value = aws_s3_bucket.site.bucket
}

output "api_url" {
  value = "${'${'}aws_api_gateway_rest_api.api.execution_arn${'}'}/prod"
}`;
  }

  // Existing heuristic/template-based selection
  const terms = promptLower.split(' ').filter(term =>
    term.length > 3 && !['the', 'and', 'for', 'with'].includes(term)
  );

  const availableTemplates = templates[configType] || [];
  if (availableTemplates.length === 0) {
    return "// No templates available for the selected configuration type";
  }

  const scoredTemplates = availableTemplates.map(template => {
    let score = 0;
    const templateString = JSON.stringify(template).toLowerCase();
    terms.forEach(term => {
      if (templateString.includes(term)) score += 1;
      if (template.provider.toLowerCase().includes(term)) score += 2;
      if (template.resourceType.toLowerCase().includes(term)) score += 2;
    });
    return { template, score };
  });

  const bestMatch = scoredTemplates.sort((a, b) => b.score - a.score)[0];
  if (!bestMatch || bestMatch.score === 0) {
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
