import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { Resend } from 'resend';
import SummaryEmail from './emails/summary-email';

type Env = {
	MAIN_WORKFLOW: Workflow;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	GOOGLE_REFRESH_TOKEN: string;
	RESEND_API_KEY: string;
	AI: Ai;
};

type Params = {
	startDate: string;
	endDate: string;
};

interface TokenResponse {
	access_token: string;
	expires_in: number;
	token_type: string;
	scope: string;
}

interface EventData {
	items: Array<{
		id: string;
		summary: string;
		description: string;
		start: { dateTime: string };
		end: { dateTime: string };
	}>;
}

interface AiResponse {
	response: string;
}

export class mainWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
		const { startDate, endDate } = event.payload;

		// Step 1: Retrieve Access Token
		const accessToken = await step.do(
			"getAccessToken",
			{ retries: { limit: 5, delay: 1000 } },
			async () => {
				const response = await fetch("https://oauth2.googleapis.com/token", {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({
						client_id: this.env.GOOGLE_CLIENT_ID,
						client_secret: this.env.GOOGLE_CLIENT_SECRET,
						refresh_token: this.env.GOOGLE_REFRESH_TOKEN,
						grant_type: "refresh_token",
					}),
				});

				if (!response.ok) throw new Error("Failed to refresh access token");
				const tokenData = (await response.json()) as TokenResponse;
				return tokenData.access_token;
			}
		);

		// Step 2: Fetch Calendar Events within Date Range
		const events = await step.do(
			"fetchMeetings",
			{ retries: { limit: 3, delay: 2000 } },
			async () => {
				const response = await fetch(
					`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate}&timeMax=${endDate}&orderBy=startTime&singleEvents=true`,
					{
						headers: { Authorization: `Bearer ${accessToken}` },
					}
				);

				if (!response.ok) throw new Error("Failed to fetch events");
				const data = (await response.json()) as EventData;
				return data.items.map((event) => ({ summary: event.summary, description: event.description }));
			}
		);

		// Step 3: Generate Summary using AI
		const descriptions = events.map(event => event.description).join("\n");
		const aiResponse = await step.do(
			"generateSummary",
			{ retries: { limit: 3, delay: 2000 } },
			async () => {
				const messages = [
					{ role: "system", content: "You are a friendly assistant" },
					{ role: "user", content: `Generate a playful summary of the user's week based on these event description:\n${descriptions}. Please just write out the playful summary, nothing more!` },
				];
				// @ts-ignore
				return await this.env.AI.run("@cf/meta/llama-3.1-70b-instruct", { messages });
			}
		) as AiResponse;

		// Step 4: Send Email using Resend
		const resend = new Resend(this.env.RESEND_API_KEY);
		await step.do(
			"sendEmail",
			{ retries: { limit: 3, delay: 2000 } },
			async () => {
				const { data, error } = await resend.emails.send({
					from: 'Gyuri <hello@gyorgymarkvarga.com>',
					to: ['gyorgy.varga@shiwaforce.com'],
					subject: 'Weekly Summary',
					react: SummaryEmail({ meetingSummary: aiResponse.response })
				});

				if (error) {
					console.error({ error });
					throw new Error("Failed to send email");
				}
			}
		);
	}
}

const startWorkflow = async (env: Env) => {
	const today = new Date();
	const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

	const instance = await env.MAIN_WORKFLOW.create({
		params: { startDate: firstDayOfWeek.toISOString(), endDate: new Date().toISOString() },
	});

	return new Response(JSON.stringify(await instance.status()), {
		headers: { "content-type": "application/json" },
	});
}

export default {
	async scheduled(
		env: Env,
		ctx: ExecutionContext,
	) {
		ctx.waitUntil(startWorkflow(env));
	},
};
