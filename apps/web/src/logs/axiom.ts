'use client';

import { Logger, AxiomJSTransport } from '@axiomhq/logging';
import { Axiom } from '@axiomhq/js';
import { createUseLogger, createWebVitalsComponent } from '@axiomhq/react';

const axiomClient = new Axiom({
  token: process.env.NEXT_PUBLIC_AXIOM_TOKEN!,
});

export const logger = new Logger({
  transports: [
    new AxiomJSTransport({
      axiom: axiomClient,
      dataset: process.env.NEXT_PUBLIC_AXIOM_DATASET!,
    }),
  ],
});

const useLogger = createUseLogger(logger);
const WebVitals = createWebVitalsComponent(logger);

export { useLogger, WebVitals };
