# Form Field Extractor

The **Form Field Extractor** is a utility library designed to extract, validate, and fill form fields using text input, voice commands, or API-based data extraction. It leverages AI to parse input text and populate form fields accurately, ensuring a seamless user experience for developers and end-users alike.

## Features

- Extract form field IDs and values dynamically from an HTML form.
- Populate form fields using text or voice inputs.
- Perform AI-based data extraction and validation via OpenAI API.
- Supports multiple input types: text, radio buttons, checkboxes, select fields, etc.
- Offers integration with text-to-speech (TTS) and speech recognition for hands-free form interaction.
- Error handling for missing fields with visual and auditory feedback.
- Customizable prompts and multilingual support (English and German).

## Installation

You can install the package via npm:

```bash
npm install form-field-extractor
```

## Usage

### 1. Extract and Populate Form Fields via Text

```javascript
import { fillFormByText } from "form-field-extractor";

const formId = "myForm";
const sourceText = "My name is John Doe, I am 30 years old, born on May 15, 1993.";

fillFormByText(formId, sourceText)
    .then((extractedData) => {
        console.log("Extracted Data:", extractedData);
    })
    .catch((error) => {
        console.error("Error:", error);
    });
```

### 2. Populate Form Fields Using Voice Commands

```javascript
import { fillFormByVoice } from "form-field-extractor";

const formId = "myForm";
const userPrompt = "Please provide your personal details.";
const languageCode = "en"; // 'en' for English, 'de' for German

fillFormByVoice(formId, userPrompt, languageCode, (status) => {
    console.log("Status Update:", status);
})
    .then((mergedData) => {
        console.log("Merged Data:", mergedData);
    })
    .catch((error) => {
        console.error("Error:", error);
    });
```

## API Methods

### `fillFormByText(formId: string, sourceText: string)`

Extracts and populates form fields based on the provided text.

- **Parameters**:
  - `formId`: The ID of the form element.
  - `sourceText`: The