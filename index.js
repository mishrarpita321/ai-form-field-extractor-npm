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
export async function fillForm(formId, apiKey, sourceText) {
    // let sourceText = "My name is John Doe, I am 30 years old, born on May 15, 1993. My email is john.doe@example.com, and I live in Germany."
    const formData = await extractFormIds(formId);
    checkSourceText(sourceText);
    const extractedJson = await extractFormValues(apiKey, sourceText, formData);
    const missingDetails = await checkMissingDetails(extractedJson, formData);
    displayErrorMessage(missingDetails);
    return extractedJson;
}

export async function fillFormByVoice(formId, apiKey, welcomeMsg, ttsKey) {
    const formData = await extractFormIds(formId);
    await speakMessage(welcomeMsg, ttsKey);

    while (true) {
        try {
            const sourceText = await listenForSpeech();
            const extractedJson = await extractFormValues(apiKey, sourceText, formData); // Extract values from speech
            const mergedJson = mergeWithExistingData(formData, extractedJson);
            const missingDetails = await checkMissingDetails(mergedJson, formData); // Check missing fields

            if (!missingDetails.hasErrors) {
                await speakMessage("Thank you for providing the information!", ttsKey);
                return mergedJson;
            }

            // Inform user about missing fields
            const errorMsg = constructErrorMessage(missingDetails.missingFields);
            displayErrorMessage(missingDetails);
            await speakMessage(errorMsg, ttsKey);
        } catch (error) {
            console.error("Error in listening or processing:", error.message);
            const retryMsg = "There was an error processing your speech. Please try again.";
            await speakMessage(retryMsg, ttsKey); // Inform user to retry
        }
    }
}