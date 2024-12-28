# FillForm Voice & Text NPM Package

## Overview
The **FillForm Voice & Text** package simplifies the process of HTML filling forms using text or voice input. It leverages GPT-4o-mini for extracting form field values from textual data, and Google Text-to-Speech (TTS) along with the Web Speech API for voice-based interactions. This package is ideal for automating form filling in scenarios like processing CVs or resumes and enabling hands-free data entry.

---

## Features
- **Text Input:** Extracts and populates form fields using text input (e.g., a resume or CV).
- **Voice Input:** Uses voice commands for a seamless hands-free form-filling experience.
- **Error Handling:** Detects and reports missing or invalid fields.
- **Customizable Messaging:** Supports personalized messages via Google Text-to-Speech.

---

## Installation
Install the package using npm:
```bash
npm i form-field-extractor
```

---

## Usage

### 1. Text-Based Form Filling
The `fillFormByText` method processes text input to populate form fields. It returns a json with extracted form fields.

#### Syntax:
```javascript
fillFormByText(formId: string, apiKey: string, sourceText: string): { id: string; value: string }[]
```

#### Parameters:
- **formId** *(string)*: ID of the form element to be filled.
- **apiKey** *(string)*: Your OpenAI API key for GPT-4o-mini.
- **sourceText** *(string)*: A descriptive text containing the information to be extracted.

#### Example:
```javascript
import { fillFormByText } from 'form-field-extractor';

const formId = "user-form";
const apiKey = "your_openai_api_key";
const sourceText = "My name is John Doe, I am 30 years old, born on May 15, 1993. My email is john.doe@example.com.";

const filledData = await fillFormByText(formId, apiKey, sourceText);
console.log(filledData);
```

---

### 2. Voice-Based Form Filling
The `fillFormByVoice` method listens to voice input and populates the form fields. It returns a json with extracted form fields.

#### Syntax:
```javascript
fillFormByVoice(formId: string, apiKey: string, welcomeMsg: string, ttsKey: string): void
```

#### Parameters:
- **formId** *(string)*: ID of the form element to be filled.
- **apiKey** *(string)*: Your OpenAI API key for GPT-4o-mini.
- **welcomeMsg** *(string)*: A welcome message played when the form is ready for interaction.
- **ttsKey** *(string)*: Your Google Text-to-Speech API key.

#### Example:
```javascript
import { fillFormByVoice } from 'fillform-voice-text';

const formId = "user-form";
const apiKey = "your_openai_api_key";
const welcomeMsg = "Welcome to the voice-based form-filling process.";
const ttsKey = "your_google_tts_api_key";

await fillFormByVoice(formId, apiKey, welcomeMsg, ttsKey);
```

---

## Scenarios

### Scenario 1: Filling Forms from Resumes
- **Use Case:** Automatically extracting information from a resume to fill a job application form.
- **Input:** "My name is Jane Smith, born on 1990-02-15. My email is jane.smith@example.com."
- **Output:** Form fields populated with extracted values.

### Scenario 2: Voice-Assisted Data Entry
- **Use Case:** Hands-free data entry for accessibility or field operations.
- **Process:** The user speaks, "My phone number is 123-456-7890," and the form field is populated automatically.

---

## Error Handling
- **Missing Fields:** If required fields are missing, they will be highlighted in red, and the user will receive feedback via toast notifications or voice messages.
- **Invalid Input:** Provides clear error messages when the input is invalid or cannot be processed.

---

## Dependencies
- [react-toastify](https://www.npmjs.com/package/react-toastify): For displaying error and success messages.
- Google Text-to-Speech API: For playing welcome and error messages.
- Web Speech API: For voice recognition.
- OpenAI GPT-4o-mini: For extracting structured data from text.

---

## Configuration
Ensure you have valid API keys for:
1. OpenAI GPT-4o-mini
2. Google Text-to-Speech

Update your `.env` file or configuration settings to include these keys.

---

## Contribution
Contributions are welcome! Feel free to open an issue or submit a pull request on GitHub.

---

## License
This package is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## Support
For issues or feature requests, please contact:
- Email: mishrarpita321@gmail.com
- GitHub: [GitHub Repository](https://github.com/mishrarpita321/form-field-extractor_npm.git)