# IaC GPT — AI-Powered Infrastructure & Workflow Generator (SaaS)

IaC GPT is a SaaS application that turns natural language into production‑ready Infrastructure as Code and CI/CD workflows. Generate Terraform, Kubernetes, Docker, CloudFormation, and Ansible configurations, plus GitHub Actions pipelines — in seconds.

- Generate secure, best‑practice IaC from plain English
- Produce GitHub Workflows tailored to your tech stack
- Copy, download, and integrate directly into your repos
- Clean, structured UI with security notes and details
- Pluggable AI backends (OpenAI or Gemini)

## Live App

- Live URL: <ADD_YOUR_PUBLIC_LINK_HERE>
- Status page (optional): <ADD_STATUSPAGE_LINK_HERE>

If you need hosting, you can deploy to Vercel, Netlify, or any static host. The app is a Vite + React SPA.

## Product Highlights

- Fast, structured generation with copy/download
- Security considerations highlighted for each output
- Config-type aware parsing and clean display (no raw JSON)
- Loading overlay for responsive UX
- Workflow configuration builder and testing scaffold

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- React Router
- TanStack Query (scaffolded)
- OpenAI or Google Gemini via REST

## Getting Started (Local Development)

1) Prerequisites
- Node.js >= 18 and npm
- An AI provider API key:
  - OpenAI: https://platform.openai.com/ (API Keys)
  - Gemini: https://aistudio.google.com/ (Get API key)

2) Clone and install
```bash
git clone <YOUR_GIT_URL>
cd ai-cloud-architect
npm install
```

3) Environment variables
Create a `.env.local` file in the project root. Choose ONE provider and fill values:

OpenAI example:
```env
VITE_AI_PROVIDER=openai
VITE_OPENAI_API_KEY=sk-xxxx
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
VITE_OPENAI_MODEL=gpt-3.5-turbo
VITE_MAX_TOKENS=2000
VITE_ENABLE_DEBUG=true
```

Gemini example:
```env
VITE_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=AIzaSy...
VITE_GEMINI_MODEL=gemini-2.0-flash
VITE_MAX_TOKENS=4000
VITE_ENABLE_DEBUG=true
```

4) Run the app
```bash
npm run dev
```
Open http://localhost:5173 (default Vite port).

## Usage

- Select your configuration type (Terraform, Kubernetes, etc.)
- Describe your infrastructure or workflow in plain English
- Click Generate
- Review explanation, security notes, and cost estimates (if available)
- Copy or download the generated files

## Deployment

Any static host will work:
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

Build and upload the `dist` folder:
```bash
npm run build
```

## Security

- Never commit `.env.local` (gitignored)
- Rotate keys regularly and apply provider-side quotas
- Review generated IaC for your organization’s security policies

## Roadmap

- Multi‑file project scaffolding
- One‑click PR to GitHub with generated artifacts
- Provider‑specific cost estimation
- Policy checks (OPA, tfsec, kube-score)
- Template library and presets

## License

MIT — see `LICENSE`.

---

Made with ❤️ for DevOps and Platform teams.
