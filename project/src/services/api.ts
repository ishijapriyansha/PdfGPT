import axios from 'axios';
// Base URL of the FastAPI backend
const API_URL = 'https://pdfgpt-gw6n.onrender.com';
/**
 * Uploads a PDF document to the backend.
 *
 * @param file - The PDF file to upload
 * @returns A promise resolving to the response containing the uploaded document's metadata (e.g., document_id)
 * @throws If the upload fails, an error is thrown
 */

export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
     // POST request to upload the file
    const response = await axios.post(`${API_URL}/upload-document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw new Error('Failed to upload document');
  }
};
/**
 * Sends a question related to a specific PDF document to the backend,
 * and returns the AI-generated answer.
 *
 * @param documentId - The ID of the uploaded document to query
 * @param question - The user's question to ask about the document
 * @returns A promise resolving to the answer from the backend (likely powered by LangChain or Gemini)
 * @throws If the request fails, an error is thrown
 */
export const askQuestion = async (documentId: string, question: string) => {
  try {
    const response = await axios.post(`${API_URL}/ask-question`, {
      document_id: documentId,
      question,
    });
    return response.data;
  } catch (error) {
    console.error('Error asking question:', error);
    throw new Error('Failed to get answer');
  }
};