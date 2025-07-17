import { Logger, AxiomJSTransport, ConsoleTransport } from "@axiomhq/logging";
import { Axiom } from "@axiomhq/js";

const axiom = new Axiom({
	token: process.env.AXIOM_TOKEN!,
});

export const logger = new Logger({
	transports: [
		new AxiomJSTransport({
			axiom,
			dataset: process.env.AXIOM_DATASET!,
		}),
		new ConsoleTransport(),
	],
});
