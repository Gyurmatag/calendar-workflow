import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Button, Hr, Link, Tailwind } from '@react-email/components';

interface EmailProps {
	meetingSummary?: string;
}

export const SummaryEmail = ({ meetingSummary = "Your AI-generated meeting summary will appear here." }: EmailProps) => {
	return (
		<Html>
			<Head />
			<Tailwind>
				<Body className="bg-white font-sans">
					<Container className="mx-auto px-6 py-8 max-w-2xl">
						<Text className="text-3xl font-bold text-center text-black mb-6">
							Your meetings summary for the day
						</Text>
						<Text className="text-lg text-gray-700 mb-4">Hello,</Text>
						<Text className="text-lg text-gray-700 mb-4">
							Here's a summary of your meetings for this day:
						</Text>
						<Section className="bg-gray-100 rounded-lg p-6 mb-6">
							<Text className="text-base text-gray-800 whitespace-pre-wrap">
								{meetingSummary}
							</Text>
						</Section>
						<Hr className="border-t border-gray-300 my-6" />
						<Section className="text-center">
							<Text className="text-lg text-gray-700 mb-4">
								Need more details? Check your full calendar:
							</Text>
							<Button
								href="https://calendar.google.com"
								className="bg-black text-white py-3 px-6 rounded text-base font-medium no-underline inline-block"
							>
								View Calendar
							</Button>
						</Section>
						<Hr className="border-t border-gray-300 my-6" />
						<Text className="text-sm text-gray-500 text-center">
							© 2024 My Calendar Summary, Inc. All rights reserved.
							<br />
							<Link href="https://example.com" className="text-blue-600 underline">
								My Calendar Summary
							</Link>
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

export default SummaryEmail;
