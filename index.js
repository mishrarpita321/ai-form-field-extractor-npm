import { checkMissingDetails, checkSourceText, constructErrorMessage, displayErrorMessage, extractFormIds, extractFormValues, listenForSpeech, mergeWithExistingData, speakMessage } from "./helper";

/**
 * Extracts input IDs and their corresponding values from a given form,
 * populates them with predefined values, and performs additional setup.
 *
 * @param {string} apiKey - The API key for authentication.
 * @param {string} formId - The ID of the form element to extract fields from.
 * @param {string} sourceText - A descriptive text for the source.
 * @param {string} [errorTestId] - (Optional) A test ID for error messages or validation.
 * @param {string} [welcomeMsg] - A welcome message to display in the console or UI.
 * @returns {Object[]} An array of objects containing `id` and `value` of each input.
 */
export async function fillFormByText(formId, apiKey, sourceText) {
    // let sourceText = "My name is John Doe, I am 30 years old, born on May 15, 1993. My email is john.doe@example.com, and I live in Germany."
    const formData = await extractFormIds(formId);
    checkSourceText(sourceText);
    const extractedJson = await extractFormValues(apiKey, sourceText, formData);
    const missingDetails = await checkMissingDetails(extractedJson, formData);
    displayErrorMessage(missingDetails);
    return extractedJson;
}

export async function fillFormByVoice(formId, apiKey, ttsKey, userPrompt, languageCode = "en") {
    const formData = await extractFormIds(formId);
    console.log("Form data:", formData);
    console.log("languageCode:", languageCode);
    const welcomeMsg = languageCode === "en" ? "Please provide the following details by speaking into the microphone." : "Bitte geben Sie die folgenden Angaben ein, indem Sie in das Mikrofon sprechen.";
    await speakMessage(welcomeMsg, ttsKey, languageCode);

    while (true) {
        try {
            const transcribedText = await listenForSpeech(languageCode);
            console.log("Transcribed text:", transcribedText);

            const extractedJson = await extractFormValues(apiKey, transcribedText, formData, userPrompt); // Extract values from speech
            console.log("Extracted JSON:", extractedJson);

            const mergedJson = mergeWithExistingData(formData, extractedJson);
            console.log("Merged JSON:", mergedJson);

            const missingDetails = await checkMissingDetails(mergedJson, formData); // Check missing fields

            if (!missingDetails.hasErrors) {
                const successMsg = languageCode === "en" ? "Thank you for providing the information. Please confirm if the details are correct, you can edit any incorrect details and submit the form by clicking on the submit button." : "Vielen Dank für die Bereitstellung der Informationen. Bitte bestätigen Sie, ob die Angaben korrekt sind. Sie können falsche Angaben bearbeiten und das Formular absenden, indem Sie auf die Schaltfläche 'Absenden' klicken.";
                await speakMessage(successMsg, ttsKey, languageCode);
                return mergedJson;
            }

            // Inform user about missing fields
            const errorMsg = constructErrorMessage(languageCode);
            displayErrorMessage(missingDetails);
            await speakMessage(errorMsg, ttsKey, languageCode); // Speak error message
        } catch (error) {
            console.error("Error in listening or processing:", error.message);
            const retryMsg = languageCode === "en" ? "Sorry, I didn't get that. Please try again." : "Entschuldigung, das habe ich nicht verstanden. Bitte versuchen Sie es erneut.";
            await speakMessage(retryMsg, ttsKey, languageCode); // Inform user to retry
        }
    }
}