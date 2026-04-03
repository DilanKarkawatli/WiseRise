export function generatePrompt(name = 'Friend', wakeTime = '07:00', wakeReason = 'No goal provided') {
	if (typeof wakeTime !== 'string' || typeof wakeReason !== 'string') {
		throw new Error(`Invalid parameters: wakeTime=${typeof wakeTime}, wakeReason=${typeof wakeReason}`);
	}

	if (process.env.DEV_MODE) {
		const prompt = [
			`Your goal is: ${wakeReason}`,
			`Write a personalized morning greeting for ${name}.`,
			`The user has set a wake up time of ${wakeTime} and their reason for waking up is: ${wakeReason}.`,
			`Do these:
			- Wise and assertive
			- Not too nice, tough and brutal.
			- Under 10 words!!

			Remember, the main purpose is to get the user to wake up!

			User name: ${name}
			Wake time: ${wakeTime}
			Wake reason: ${wakeReason}

			Message: \n`
		]

		return prompt
	
	} else {
		const prompt = [
			`Write a personalized morning greeting for ${name}.`,
			`The user has set a wake up time of ${wakeTime} and their reason for waking up is: ${wakeReason}.`,
			`Do these:
			- Start slowly, and tell the user something morning related, like observing something.
			- Tell word for word the user's goal, so they get a reminder of what's important
			- Tell philosophic life wisdom & quotes from literature WITHOUT BEING CLICHE!!!!
			- Talk straightforward and non poetically. 
			- Say impactful things.
			- The goal is to evoke thought within a groggy and sleepy user, so that they think "Yeah, that's right, I do need to get up."
			- Tell personally empowering truths. Like "Each small step builds toward..."
			- Nothing abstract, just practical and observational, like "the world has already awoken, birds are singing."
			- And after each piece of wisdom, nudge a little to make the user get up.
			- Speak with a deep, calm, masculine tone. Resonant and grounded.
			- Remind the user that the world is moving with or without them
			- Tell them something that they might not have known before
			- MOST IMPORTAT: It has to be intuitive! The user shouldn't have to think to feel it.
			- Optimistic
			- Wise and assertive
			- Not too nice, tough and brutal.
			- Under 10 words!!

			Remember, the main purpose is to get the user to wake up!

			User name: ${name}
			Wake time: ${wakeTime}
			Wake reason: ${wakeReason}

			Message: \n`
		]
		return prompt
	}
}
