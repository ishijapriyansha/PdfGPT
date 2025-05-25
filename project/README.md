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

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- Google Gemini API key

### Installation

1. Clone the repository

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up your Google Gemini API key:
```bash
# Linux/Mac
export GOOGLE_API_KEY="your-api-key-here"

# Windows
set GOOGLE_API_KEY="your-api-key-here"
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

## Usage

1. Upload a PDF document using the upload interface
2. Click on the uploaded document to open the chat interface
3. Ask questions about the document content
4. View AI-generated responses based on the document

## Note

This application requires a Google Gemini API key to function properly. The key is used for generating embeddings and answering questions based on document content.