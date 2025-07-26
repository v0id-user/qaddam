# Qaddam - AI-Powered Job Search & Resume Matching

~~**Paste your resume, hack your job search.**~~ Just a Utility to help search process.

Qaddam is an AI-native job search platform designed specifically for developers and engineers. Built by a developer for developers, it eliminates the need to manually browse LinkedIn or Indeed by providing intelligent resume matching and automated job discovery.

## About Qaddam

Qaddam is not just another job board - it's a complete AI-powered job search assistant that:

- **Analyzes your resume** using advanced AI to extract your skills, experience, and qualifications
- **Matches you with relevant jobs** from multiple sources using intelligent algorithms
- **Provides personalized insights** on why specific positions match your profile
- **Aggregates job listings** from various platforms into one searchable, filterable interface
- **Supports bilingual search** in English and Arabic for the regional market
- **Offers both self-hosted and managed options** to fit different needs

### Key Value Propositions

- **AI-Native Approach**: Every step uses AI - from parsing your CV to ranking job matches
- **Developer-Focused**: Built with engineers in mind, offering technical precision without marketing fluff  
- **Open Source Freedom**: Free tier allows complete self-hosting with full control
- **Managed Convenience**: Pro version ($4/month) provides fully managed infrastructure
- **Time-Saving**: No more manual browsing across multiple job sites
- **Intelligent Matching**: Get matched with jobs that actually fit your profile

### Target Users

- Software developers and engineers looking for new opportunities
- Technical professionals who want AI-powered job search automation
- Developers who prefer open-source, transparent solutions
- Engineers tired of manually checking multiple job platforms

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Convex, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Convex** - Reactive backend-as-a-service platform
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Convex Setup

This project uses Convex as a backend. You'll need to set up Convex before running the app:

```bash
bun dev:setup
```

Follow the prompts to create a new Convex project and connect it to your application.

Then, run the development server:

```bash
bun dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
Your app will connect to the Convex cloud backend automatically.



## Project Structure

```
qaddam/
├── apps/
│   ├── web/         # Frontend application (Next.js)
├── packages/
│   └── backend/     # Convex backend functions and schema
```

## Available Scripts

- `bun dev`: Start all applications in development mode
- `bun build`: Build all applications
- `bun dev:web`: Start only the web application
- `bun dev:setup`: Setup and configure your Convex project
- `bun check-types`: Check TypeScript types across all apps
