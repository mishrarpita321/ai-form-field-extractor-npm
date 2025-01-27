/**
 * Extracts input IDs and their corresponding values from a given form, 
 * populates them with predefined values, and performs additional setup.
 *
 * @param apiKey - The API key for authentication.
 * @param formId - The ID of the form element to extract fields from.
 * @param source - The source system or identifier.
 * @returns An array of objects containing `id` and `value` of each input.
 */
export declare function fillFormByText(
    formId: string,
    sourceText: string,
): { id: string; value: string }[];

/**
 * Fills a form using voice commands.
 *
 * @param formId - The ID of the form to be filled.
 * @param userPrompt - The custom prompt to llm.
 * @param languageCode - The language code for the voice recognition service.
 * @param statusCallback - A callback function to receive status updates.
 */
export declare function fillFormByVoice(
    formId: string,
    userPrompt?: string,
    languageCode?: string,
    statusCallback?: (status: { isPlaying: boolean; isRecording: boolean }) => void // Optional callback for status updates
): Promise<void>;