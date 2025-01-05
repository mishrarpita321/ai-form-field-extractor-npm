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
    apiKey: string,
    sourceText: string,
): { id: string; value: string }[];

/**
 * Fills a form using voice commands.
 *
 * @param formId - The ID of the form to be filled.
 * @param apiKey - The API key for accessing the voice recognition service.
 * @param welcomeMsg - The welcome message to be played when the form is ready to be filled.
 * @param ttsKey - The API key for the text-to-speech service.
 * @param userPrompt - The custom prompt to llm.
 * @param languageCode - The language code for the voice recognition service.
 */
export declare function fillFormByVoice(
    formId: string,
    apiKey: string,
    ttsKey?: string,
    userPrompt?: string,
    languageCode?: string,
): void;