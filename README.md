# Qaddam - AI-Powered Job Search & Resume Matching

~~**Paste your resume, hack your job search.**~~ Just a Utility to help search process.

Qaddam is an AI-native job search platform designed specifically for developers and engineers. Built by a developer for developers, it help speed up the process of finding a job by providing intelligent resume matching and automated job discovery.

## About Qaddam

Qaddam is just another job board - it's a complete AI-powered job search assistant that:

- **Analyzes your resume** using advanced AI to extract your skills, experience, and qualifications
- **Matches you with relevant jobs** from multiple sources using intelligent algorithms
- **Provides personalized insights** on why specific positions match your profile
- **Aggregates job listings** from various platforms into one searchable, filterable interface
- **Offers both self-hosted and managed options** to fit different needs

### Key Value Propositions

- **AI-Native Approach**: Every step uses AI - from parsing your CV to ranking job matches
- **Open Source Freedom**: Allows complete self-hosting with full control
- **Intelligent Matching**: Get matched with jobs that actually fit your profile

### Target Users

- Software developers and engineers looking for new opportunities
- Technical professionals who want AI-powered job search automation
- Developers who prefer open-source, transparent solutions

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

Open [http://localhost:3000](http://localhost:3000) in your browser to see the web application.
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

# Self hosting

You can self host the project by following the [Self hosting guide](./SELFHOST.md).

# How much does it cost to run this project?

It's not much. Most of the cloud providers offer really good free tiers. But apify righfuly so, can be little pricey.
Check [COSTS.md](./COSTS.md) for more details.

# Legal stuff

## Can I use this commercially?

Yes! — **you can use and sell this as a commercial product**, as long as you comply with the terms of the [AGPLv3 License](./LICENSE.md):

* You **must disclose your full source code**, including any server-side or backend modifications if the software is used over a network
* You **must retain the same license (AGPLv3)**
* You **must clearly state any changes or modifications you make**

However, **all visual assets** (logos, icons, screenshots, etc.) are **not part of the open-source license**. They are the property of the original author and **may not be reused, redistributed, or repurposed** in any form.

See [ASSETS-LICENSE.md](./ASSETS-LICENSE.md) for details.

Any violation of the license terms will result in a **DMCA takedown**.

> **Note:** This isn’t gatekeeping — it’s about keeping open-source sustainable, especially for tiny small independent projects.