import { toast } from 'react-toastify';

/**
 * Extracts input IDs and their corresponding values from a given form,
 * and updates each field's value to "test".
 * @param {string} formId - The ID of the form element to extract fields from.
 */
export async function extractFormIds(formId) {
    const form = document.getElementById(formId);

    if (!form) {
        console.error(`Form with ID "${formId}" not found.`);
        return;
    }

    const inputs = form.querySelectorAll('input, textarea, select');
    const fieldData = [];

    inputs.forEach(input => {
        if (input.id) {
            fieldData.push({
                id: input.id,
                value: input.value,
            });
        }
    });

    return fieldData;
}

/**
 * Checks the validity of the source and sourceText parameters.
 *
 * @param {string} source - The source type, which should be a non-empty string.
 * @throws {Error} Throws an error if the sourceText is not provided.
 */
export function checkSourceText(sourceText) {
    if (!sourceText) {
        throw new Error("sourceText cannot be null.");
    }
}

/**
 * Extracts form values from the provided source text using the OpenAI API.
 *
 * @param {string} apiKey - The API key for authentication with the OpenAI API.
 * @param {string} transcribedText - The text from which to extract form values.
 * @param {Array} formData - An array of form field objects, each containing an `id` property.
 * @returns {Promise<Object>} A promise that resolves to an object containing the extracted form values.
 * @throws Will throw an error if the API request fails.
 */
export async function extractFormValues(apiKey, transcribedText, formData, userPrompt) {
    validateInputs(apiKey, transcribedText, formData);

    const prompt = userPrompt || generatePrompt(formData);
    const requestData = buildRequestData(transcribedText, prompt, formData);

    try {
        const response = await makeApiCall(apiKey, requestData);
        return parseResponse(response);
    } catch (error) {
        console.error("Error extracting form values:", error);
        throw error; // or return a standardized error object
    }
}

function validateInputs(apiKey, transcribedText, formData) {
    if (!apiKey) throw new Error("API key is required.");
    if (!transcribedText) throw new Error("Source text is required.");
    if (!Array.isArray(formData) || formData.some(field => !field.id)) {
        throw new Error("Invalid formData: Must be an array of objects with 'id' properties.");
    }
}

function generatePrompt(formData) {
    const ids = formData.map(field => field.id).join(", ");
    return `Extract the following keys from the provided text: ${ids}. 
        Ensure missing fields are returned as empty strings. Format dates as "YYYY-MM-DD", emails in lowercase 
        with no spaces, and all text values starting with uppercase.`;
}

function buildRequestData(sourceText, prompt, formData) {
    const ids = formData.map(field => field.id).join(", ");

    return {
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a highly skilled data extraction assistant. Always respond in JSON format. Ensure missing fields are returned as empty strings. Extract the following keys ${ids} from the provided text.`,
            },
            { role: "system", content: prompt },
            { role: "user", content: sourceText },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
    };
}

async function makeApiCall(apiKey, requestData) {
    const url = "https://api.openai.com/v1/chat/completions";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestData),
    });

    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }

    return response.json();
}

function parseResponse(data) {
    try {
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        throw new Error("Failed to parse API response.");
    }
}

/**
 * Checks for missing details in the extracted JSON data and fills the form fields.
 *
 * @param {Object} extractedJson - The JSON object containing the extracted data.
 * @param {Array} formData - An array of form field objects, each containing an `id` property.
 * @returns {Promise<Object>} An object containing:
 *   - `missingFields` {Array}: An array of field IDs that are missing in the extracted JSON.
 *   - `hasErrors` {boolean}: A flag indicating whether there are any missing fields.
 */
export async function checkMissingDetails(extractedJson, formData) {
    const missingFields = [];
    let hasErrors = false;

    formData.forEach(field => {
        const fieldElement = document.getElementById(field.id);

        if (!fieldElement) {
            console.warn(`Field with ID "${field.id}" not found.`);
            return;
        }

        const inputType = fieldElement.type;
        const fieldName = fieldElement.name;

        switch (inputType) {
            case "radio":
                // Handle radio buttons
                const radioGroup = document.getElementsByName(fieldName);
                let isRadioFilled = false;

                radioGroup.forEach(radio => {
                    if (radio.value === extractedJson[fieldName]) {
                        radio.checked = true;
                        isRadioFilled = true;
                    }
                });

                if (!isRadioFilled) {
                    missingFields.push(fieldName);
                    hasErrors = true;
                    radioGroup.forEach(radio => (radio.style.border = "2px solid red"));
                } else {
                    radioGroup.forEach(radio => (radio.style.border = ""));
                }
                break;

            case "checkbox":
                // Handle checkboxes
                const checkboxes = document.querySelectorAll(`input[name="${fieldName}"][type="checkbox"]`);
                let isCheckboxFilled = false;

                checkboxes.forEach(checkbox => {
                    if (extractedJson[fieldName]?.includes(checkbox.value)) {
                        checkbox.checked = true;
                        isCheckboxFilled = true;
                    }
                });

                if (!isCheckboxFilled) {
                    missingFields.push(fieldName);
                    hasErrors = true;
                    checkboxes.forEach(checkbox => (checkbox.style.border = "2px solid red"));
                } else {
                    checkboxes.forEach(checkbox => (checkbox.style.border = ""));
                }
                break;

            default:
                // Handle text, select, textarea, etc.
                const value = extractedJson[field.id] || "";
                if (value.trim()) {
                    fieldElement.value = value;
                    fieldElement.style.border = "";
                } else {
                    missingFields.push(field.id);
                    hasErrors = true;
                    fieldElement.style.border = "2px solid red";
                }
                break;
        }
    });

    console.log("Missing fields:", missingFields);
    if (missingFields.length) {
        console.error(`Missing fields: ${missingFields.join(", ")}`);
    }

    return { missingFields, hasErrors };
}

/**
 * Displays an error message if there are missing fields and errors.
 *
 * @param {Object} missingDetails - The details of the missing fields and errors.
 * @param {Array<string>} missingDetails.missingFields - An array of missing field names.
 * @param {boolean} missingDetails.hasErrors - A flag indicating if there are errors.
 */
export function displayErrorMessage(missingDetails) {
    const { missingFields, hasErrors } = missingDetails;

    if (hasErrors && missingFields.length) {
        toast.error(`Missing fields: ${missingFields.join(", ")}`, {
            position: "bottom-right",
            theme: "light",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    } else {
        toast.success("All fields are filled successfully!", {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    }
}

export async function speakMessage(text, ttsKey, languageCode="en") {
    const endpoint = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${ttsKey}`;
    const payload = {
        audioConfig: {
            audioEncoding: "MP3",
            effectsProfileId: ["small-bluetooth-speaker-class-device"],
            pitch: 0,
            speakingRate: 1, // Normal speaking rate
        },
        input: { text },
        voice: {
            languageCode: languageCode === "en" ? "en-US" : "de-DE",
            name: languageCode === "en" ? "en-US-Journey-F" : "de-DE-Standard-F",
        },
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.audioContent) {
            throw new Error("No audio content received from the API.");
        }

        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        const audio = new Audio(audioSrc);

        // Return a promise that resolves when the audio finishes playing
        await new Promise((resolve, reject) => {
            audio.onended = () => {
                console.log("Audio playback completed.");
                resolve(); // Resolve when playback ends
            };
            audio.onerror = (error) => {
                reject(new Error("Audio playback failed."));
            };
            audio.play();
        });
    } catch (error) {
        console.error("Error during TTS operation:", error);
    }
}

export async function listenForSpeech(languageCode) {
    return new Promise((resolve, reject) => {
        // Check if the browser supports the Web Speech API
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            reject(new Error("Web Speech API is not supported in this browser."));
            return;
        }

        // Initialize the SpeechRecognition object
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        // Configure the SpeechRecognition object
        recognition.lang = languageCode === 'en' ? 'en-US' : 'de-DE';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        // Start listening
        recognition.start();

        // Handle successful transcription
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            resolve(transcript); // Resolve the Promise with the transcribed text
        };

        // Handle errors
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            // reject(new Error(`Speech recognition error: ${event.error}`));
            resolve(""); // Resolve with an empty string
        };

        // Handle recognition end
        recognition.onend = () => {
            console.log("Speech recognition ended.");
            resolve(""); // Resolve with an empty string
        };
    });
}

export function mergeWithExistingData(formData, extractedJson) {
    const mergedJson = {};

    formData.forEach(field => {
        const inputElement = document.getElementById(field.id);

        if (!inputElement) {
            console.warn(`Input element with ID "${field.id}" not found.`);
            return;
        }

        const inputType = inputElement.type;

        switch (inputType) {
            case "radio":
                // Handle radio group
                const radioGroup = document.getElementsByName(inputElement.name);
                let selectedRadio = "";
                if (extractedJson[field.id]) {
                    selectedRadio = extractedJson[field.id];
                } else {
                    radioGroup.forEach(radio => {
                        if (radio.checked) selectedRadio = radio.value;
                    });
                }
                mergedJson[inputElement.name] = selectedRadio;
                break;

            case "checkbox":
                // Handle checkboxes (grouped or single)
                const checkboxes = document.querySelectorAll(`input[name="${inputElement.name}"][type="checkbox"]`);
                let selectedCheckboxes = [];
                if (extractedJson[field.id]) {
                    selectedCheckboxes = extractedJson[field.id];
                } else {
                    checkboxes.forEach(checkbox => {
                        if (checkbox.checked) selectedCheckboxes.push(checkbox.value);
                    });
                }
                mergedJson[inputElement.name] = selectedCheckboxes;
                break;

            default:
                // Handle text, date, email, select, etc.
                mergedJson[field.id] = extractedJson[field.id] || inputElement.value || "";
                break;
        }
    });

    return mergedJson;
}


export function constructErrorMessage(languageCode) {
    const message = languageCode === "en" ? "The highlighted fields are missing. Please provide the missing details." : "Die markierten Felder fehlen. Bitte geben Sie die fehlenden Details an.";
    return message;
}