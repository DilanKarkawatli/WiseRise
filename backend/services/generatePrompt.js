export function generatePrompt(name, wakeTime) {
	const prompt = [
		`Write a personalized morning greeting for ${name}.`,
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
		- Under 10 words

		Remember, the main purpose is to get the user to wake up!

		User name: ${name}
		Wake time: ${wakeTime}

		Message: \n`
	]
	
	return prompt.join("\n");
}