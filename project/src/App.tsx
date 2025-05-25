import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import { DocumentProvider } from './context/DocumentContext';
/**
 * Main application component that sets up routing and global state.
 *
 * - Wraps the app with `DocumentProvider` to provide access to document context.
 * - Defines routes for Home and Chat pages.
 *
 * Routes:
 * - `/` → HomePage: Upload and manage documents.
 * - `/chat/:documentId` → ChatPage: Chat interface for a specific document.
 *
 * @returns The root component of the application.
 */
function App() {
  return (
    <DocumentProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat/:documentId" element={<ChatPage />} />
        </Routes>
      </div>
    </DocumentProvider>
  );
}

export default App;