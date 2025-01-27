import { checkMissingDetails, checkSourceText, constructErrorMessage, displayErrorMessage, extractFormIds, extractFormValues, listenForSpeech, mergeWithExistingData, speakMessage } from "./helper";

/**
 * Extracts input IDs and their corresponding values from a given form,
 * populates them with predefined values, and performs additional setup.
 *
 * @param {string} formId - The ID of the form element to extract fields from.
 * @param {string} sourceText - A descriptive text for the source.
 * @param {string} [errorTestId] - (Optional) A test ID for error messages or validation.
 * @param {string} [welcomeMsg] - A welcome message to display in the console or UI.
 * @returns {Object[]} An array of objects containing `id` and `value` of each input.
 */
export async function fillFormByText(formId, sourceText) {
    // let sourceText = "My name is John Doe, I am 30 years old, born on May 15, 1993. My email is john.doe@example.com, and I live in Germany."
    const formData = await extractFormIds(formId);
    checkSourceText(sourceText);

    const startExtraction = performance.now();
    const extractedJson = await extractFormValues(sourceText, formData);
    const endExtraction = performance.now();
    console.log("Extraction time:", endExtraction - startExtraction, "ms");

    const startformFilling = performance.now();
    const missingDetails = await checkMissingDetails(extractedJson, formData);
    const endformFilling = performance.now();
    console.log("Form filling time:", endformFilling - startformFilling, "ms");

    displayErrorMessage(missingDetails);
    return extractedJson;
}

export async function fillFormByVoice(
    formId,
    userPrompt,
    languageCode = "en",
    statusCallback = () => { } // Callback to update the status
) {
    const formData = await extractFormIds(formId);

    const welcomeMsg =
        languageCode === "en"
            ? "Please provide the following details by speaking into the microphone."
            : "Bitte geben Sie die folgenden Angaben ein, indem Sie in das Mikrofon sprechen.";

    try {
        // TTS: Playing Welcome Message
        statusCallback({ isPlaying: true, isRecording: false });
        await speakMessage(welcomeMsg, languageCode);
        statusCallback({ isPlaying: false, isRecording: false });

        while (true) {
            try {
                // Voice Recognition: Start Listening
                statusCallback({ isPlaying: false, isRecording: true });
                const transcribedText = await listenForSpeech(languageCode);
                statusCallback({ isPlaying: false, isRecording: false });

                // Extract Form Values from Transcribed Text
                const extractedJson = await extractFormValues(transcribedText, formData, userPrompt);
                const mergedJson = mergeWithExistingData(formData, extractedJson);

                // Check for Missing Fields
                const missingDetails = await checkMissingDetails(mergedJson, formData);

                if (!missingDetails.hasErrors) {
                    // TTS: Success Message
                    const successMsg =
                        languageCode === "en"
                            ? "Thank you for providing the information. Please confirm if the details are correct..."
                            : "Vielen Dank für die Bereitstellung der Informationen...";
                    statusCallback({ isPlaying: true, isRecording: false });
                    await speakMessage(successMsg, languageCode);
                    statusCallback({ isPlaying: false, isRecording: false });

                    return mergedJson; // End process if successful
                }

                // TTS: Error Message
                const errorMsg = constructErrorMessage(languageCode, missingDetails.missingFields);
                displayErrorMessage(missingDetails);
                statusCallback({ isPlaying: true, isRecording: false });
                await speakMessage(errorMsg, languageCode);
                statusCallback({ isPlaying: false, isRecording: false });
            } catch (error) {
                console.error("Error in listening or processing:", error.message);

                // TTS: Retry Message
                const retryMsg =
                    languageCode === "en"
                        ? "Sorry, I didn't get that. Please try again."
                        : "Entschuldigung, das habe ich nicht verstanden. Bitte versuchen Sie es erneut.";
                statusCallback({ isPlaying: true, isRecording: false });
                await speakMessage(retryMsg, languageCode);
                statusCallback({ isPlaying: false, isRecording: false });
            }
        }
    } catch (error) {
        console.error("Error in TTS or Voice Interaction:", error.message);
        statusCallback({ isPlaying: false, isRecording: false });
        throw error; // Ensure proper error propagation
    }
}