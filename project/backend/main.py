from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import uuid
import aiosqlite
import fitz  
from typing import List, Dict
import tempfile
import asyncio
import logging
from dotenv import load_dotenv
load_dotenv()
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

# configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise EnvironmentError("GOOGLE_API_KEY is not set in .env file")
os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY


# define the storage paths
UPLOAD_DIR = "uploads"
DB_PATH = "documents.db"
VECTOR_STORE_DIR = "vector_stores"

# create necessary directories
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VECTOR_STORE_DIR, exist_ok=True)

# initialize database
async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                path TEXT NOT NULL,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()

# document stores
document_stores: Dict[str, FAISS] = {}
conversation_chains: Dict[str, ConversationalRetrievalChain] = {}

# request models
class QuestionRequest(BaseModel):
    document_id: str
    question: str

# On startup 
@app.on_event("startup")
async def startup_event():
    await init_db()
    # Load existing document stores
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT id FROM documents") as cursor:
            rows = await cursor.fetchall()
            for row in rows:
                document_id = row[0]
                vector_store_path = os.path.join(VECTOR_STORE_DIR, document_id)
                if os.path.exists(vector_store_path):
                    try:
                        document_stores[document_id] = FAISS.load_local(
                            vector_store_path, 
                            GoogleGenerativeAIEmbeddings(model="models/embedding-001"),
                             allow_dangerous_deserialization=True
                        )
                        logger.info(f"Loaded vector store for document {document_id}")
                    except Exception as e:
                        logger.error(f"Error loading vector store for document {document_id}: {e}")

# extract text from pdf
async def extract_text_from_pdf(file_path: str) -> str:
    try:
        with fitz.open(file_path) as pdf:
            text = ""
            for page in pdf:
                text += page.get_text()
            return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise

# process document in background
async def process_document(document_id: str, file_path: str):
    try:
        # extract text from pdf
        text = await extract_text_from_pdf(file_path)
        
        # split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        chunks = text_splitter.split_text(text)
        
        # create vector store
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vector_store = FAISS.from_texts(chunks, embeddings)
        
        # save vector store
        vector_store_path = os.path.join(VECTOR_STORE_DIR, document_id)
        vector_store.save_local(vector_store_path)
        
        # store in memory
        document_stores[document_id] = vector_store
        
        # create conversation chain
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        llm = GoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)
        conversation_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vector_store.as_retriever(),
            memory=memory,
        )
        conversation_chains[document_id] = conversation_chain
        
        logger.info(f"Document {document_id} processed successfully")
    except Exception as e:
        logger.error(f"Error processing document {document_id}: {e}")

# upload document endpoint
@app.post("/upload-document")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    try:
        # validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # generate unique ID for the document
        document_id = str(uuid.uuid4())
        
        # save file
        file_path = os.path.join(UPLOAD_DIR, f"{document_id}.pdf")
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # save document info to database
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                "INSERT INTO documents (id, filename, path) VALUES (?, ?, ?)",
                (document_id, file.filename, file_path)
            )
            await db.commit()
        
        # process document in background
        background_tasks.add_task(process_document, document_id, file_path)
        
        return {"document_id": document_id, "message": "Document uploaded successfully"}
    
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ask question endpoint
@app.post("/ask-question")
async def ask_question(request: QuestionRequest):
    try:
        document_id = request.document_id
        question = request.question
        
        # check if document exists
        if document_id not in document_stores:
        

            # load from disk if not in document_store
            vector_store_path = os.path.join(VECTOR_STORE_DIR, document_id)
           
            if os.path.exists(vector_store_path):
                document_stores[document_id] = FAISS.load_local(
                    vector_store_path, 
                    GoogleGenerativeAIEmbeddings(model="models/embedding-001"),
                     allow_dangerous_deserialization=True
                )
                
                # create conversation chain
                memory = ConversationBufferMemory(
                    memory_key="chat_history",
                    return_messages=True
                )
                llm = GoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)
                conversation_chains[document_id] = ConversationalRetrievalChain.from_llm(
                    llm=llm,
                    retriever=document_stores[document_id].as_retriever(),
                    memory=memory,
                )
                
                
            else:
                raise HTTPException(status_code=404, detail="Document not found or still processing")
        
        # get conversation chain
        conversation_chain = conversation_chains.get(document_id)
        if not conversation_chain:
            # create a new chain if needed
            memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
            llm = GoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)
            conversation_chain = ConversationalRetrievalChain.from_llm(
                llm=llm,
                retriever=document_stores[document_id].as_retriever(),
                memory=memory,
            )
            conversation_chains[document_id] = conversation_chain
        
        # get answer
        response = conversation_chain({"question": question})
        answer = response["answer"]
        
        return {"answer": answer}
    
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
