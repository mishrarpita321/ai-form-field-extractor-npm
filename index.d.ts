/**
 * Extracts input IDs and their corresponding values from a given form, 
 * populates them with predefined values, and performs additional setup.
 *
 * @param apiKey - The API key for authentication.
 * @param formId - The ID of the form element to extract fields from.
 * @param source - The source system or identifier.
 * @param sourceText - A descriptive text for the source.
 * @param errorTestId - (Optional) A test ID for error messages or validation.
 * @param welcomeMsg - A welcome message to display in the console or UI.
 * @returns An array of objects containing `id` and `value` of each input.
 */
export declare function fillForm(
    formId: string,
    apiKey: string,
    sourceText: string,
): { id: string; value: string }[];

export declare function fillFormByVoice(
    formId: string,
    apiKey: string,
    welcomeMsg: string,
    ttsKey: string,
): void;