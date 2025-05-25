# PDF Q&A Application

A full-stack application that allows users to upload PDF documents and ask questions about their content using AI.

## Features

- Upload and manage PDF documents
- Ask questions about PDF content
- Receive AI-generated answers based on document context
- Responsive design for all devices

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API requests

### Backend
- FastAPI (Python)
- LangChain with Google Gemini for document processing and Q&A
- SQLite for document metadata storage
- PyMuPDF for PDF text extraction
- Google Gemini API for embeddings and QA generation

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- Google Gemini API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/ishijapriyansha/PdfGPT
cd project
```
2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up your Gemini API key in .env file:
```bash
 GOOGLE_API_KEY="your-api-key-here"
```

### Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## API Overview-
Base URL: http://localhost:8000

1. POST: /upload-document: Upload a PDF file to the server. The document will be stored and processed for future question answering.
- Headers:
Content-Type: multipart/form-data
- Body: Form field file – the PDF file to upload
sample response
```bash
{
  "document_id": "1a2b3c4d-1234-5678-9012-abcdefabcdef",
  "message": "Document uploaded successfully"
}
```
- Errors:
400 Bad Request: File is not a valid PDF
500 Internal Server Error: Server-side processing failure


2. POST: /ask-question: Ask a question about a previously uploaded PDF document. The backend uses vector search and Google Gemini to generate an answer based on the document's content.
- Request: Headers:
Content-Type: application/json
Body:
```bash
{
  "document_id": "1a2b3c4d-1234-5678-9012-abcdefabcdef",
  "question": "What is the document about?"
}
```
Response
```bash
{
  "answer": "The document discusses the principles of waste water treatment in the paper industry..."
}
```

-Errors:
404 Not Found: Document doesn't exist or hasn't been processed yet
500 Internal Server Error: Gemini/vector search failure

3. GET /health: Simple health check endpoint to confirm the backend is online.
```bash
{
  "status": "ok"
}
```
## Usage

1. Upload a PDF document using the upload interface
2. Click on the uploaded document to open the chat interface
3. Ask questions about the document content
4. View AI-generated responses based on the document

## Note

This application requires a Google Gemini API key to function properly. The key is used for generating embeddings and answering questions based on document content.
