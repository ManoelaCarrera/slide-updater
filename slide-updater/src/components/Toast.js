import { useState } from 'react';
const ToastContext = React.createContext(undefined);
export function ToastProvider({ children }) {
    const [messages, setMessages] = useState([]);
    const addToast = (message, type, duration = 3000) => {
        const id = `${Date.now()}-${Math.random()}`;
        const toast = { id, message, type, duration };
        setMessages(prev => [...prev, toast]);
        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    };
    const removeToast = (id) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    };
    return (<ToastContext.Provider value={{ messages, addToast, removeToast }}>
      {children}
      <ToastContainer messages={messages} onRemove={removeToast}/>
    </ToastContext.Provider>);
}
export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context)
        throw new Error('useToast must be within ToastProvider');
    return context;
}
function ToastContainer({ messages, onRemove }) {
    return (<div className="fixed bottom-4 right-4 space-y-2 z-50">
      {messages.map(toast => (<Toast key={toast.id} toast={toast} onRemove={onRemove}/>))}
    </div>);
}
function Toast({ toast, onRemove }) {
    const [isExiting, setIsExiting] = useState(false);
    const typeStyles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-white',
    };
    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
    };
    return (<div className={`${typeStyles[toast.type]} px-4 py-3 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}>
      <div className="flex items-center justify-between gap-3">
        <span>{toast.message}</span>
        <button onClick={handleClose} className="text-lg leading-none hover:opacity-75" aria-label="Close">
          ✕
        </button>
      </div>
    </div>);
}
