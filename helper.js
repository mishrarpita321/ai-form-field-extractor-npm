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

    console.log('Extracted Form Fields:', fieldData);
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
 * @param {string} sourceText - The text from which to extract form values.
 * @param {Array} formData - An array of form field objects, each containing an `id` property.
 * @returns {Promise<Object>} A promise that resolves to an object containing the extracted form values.
 * @throws Will throw an error if the API request fails.
 */
export async function extractFormValues(apiKey, sourceText, formData) {
    if (!apiKey) {
        console.error("API key is required.");
    }

    if (!sourceText) {
        console.error("Source text is required.");
    }
    const ids = formData.map(field => field.id).join(", ");
    console.log(`Extracting the following keys from the provided text: ${ids}`);
    const url = "https://api.openai.com/v1/chat/completions";
    const requestData = {
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a helpful assistant and you only reply with JSON. Extract only the following keys from the provided text: Required keys: ${ids}. Empty values for missing keys. Ensure all the extracted values are starting with uppercase. The date should be in the format of "YYYY-MM-DD". The email should be in lowercase with no spaces.`,
            },
            {
                role: "user",
                content: sourceText,
            },
        ],
        response_format: {
            type: "json_object",
        },
        temperature: 0.7
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestData),
        });

        const data = await response.json();
        const completion = JSON.parse(data.choices[0].message.content);
        return completion;
    } catch (error) {
        console.error(error);
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

    // Loop through formData to check missing fields and fill the form
    formData.forEach(field => {
        const fieldId = field.id;
        const fieldElement = document.getElementById(fieldId);

        if (!extractedJson[fieldId] || extractedJson[fieldId].trim() === "") {
            missingFields.push(fieldId);
            hasErrors = true; 
            fieldElement.style.border = "2px solid red";
        } else if (fieldElement) {
            fieldElement.style.border = "";
            fieldElement.value = extractedJson[fieldId];
        }
    });

    console.log("missingFields", missingFields);
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
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
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

export async function speakMessage(text, ttsKey) {
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
            languageCode: "en-US",
            name: "en-US-Journey-F",
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

export async function listenForSpeech() {
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
        recognition.lang = 'en-US';
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
        const fieldId = field.id;
        // Retain existing value if it exists; otherwise, use the new value
        mergedJson[fieldId] = extractedJson[fieldId] || document.getElementById(fieldId)?.value || "";
    });
    return mergedJson;
}

export function constructErrorMessage(missingFields) {
    return `The following fields are missing or incorrect: ${missingFields.join(", ")}. Please provide the missing details.`;
}
