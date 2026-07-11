import { useState, useRef, useCallback } from 'react';
export function useRichText(initialHtml = '') {
    const [state, setState] = useState({
        html: initialHtml,
        isDirty: false,
    });
    const editorRef = useRef(null);
    const setHtml = useCallback((html) => {
        setState({ html, isDirty: true });
        if (editorRef.current) {
            editorRef.current.innerHTML = html;
        }
    }, []);
    const getHtml = useCallback(() => {
        return editorRef.current?.innerHTML || state.html;
    }, [state.html]);
    const clearDirtyFlag = useCallback(() => {
        setState(prev => ({ ...prev, isDirty: false }));
    }, []);
    const executeCommand = useCallback((command, value) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            setState({
                html: editorRef.current.innerHTML,
                isDirty: true,
            });
        }
    }, []);
    const handleInput = useCallback(() => {
        if (editorRef.current) {
            setState({
                html: editorRef.current.innerHTML,
                isDirty: true,
            });
        }
    }, []);
    const toggleBold = useCallback(() => {
        executeCommand('bold');
    }, [executeCommand]);
    const toggleItalic = useCallback(() => {
        executeCommand('italic');
    }, [executeCommand]);
    const toggleUnderline = useCallback(() => {
        executeCommand('underline');
    }, [executeCommand]);
    const toggleCode = useCallback(() => {
        executeCommand('formatBlock', '<code>');
    }, [executeCommand]);
    const insertLink = useCallback((url) => {
        executeCommand('createLink', url);
    }, [executeCommand]);
    const formatHeading = useCallback((level) => {
        executeCommand('formatBlock', `<${level}>`);
    }, [executeCommand]);
    const insertBulletList = useCallback(() => {
        executeCommand('insertUnorderedList');
    }, [executeCommand]);
    const insertNumberedList = useCallback(() => {
        executeCommand('insertOrderedList');
    }, [executeCommand]);
    const insertQuote = useCallback(() => {
        executeCommand('formatBlock', '<blockquote>');
    }, [executeCommand]);
    const clearFormatting = useCallback(() => {
        executeCommand('removeFormat');
    }, [executeCommand]);
    return {
        editorRef,
        html: state.html,
        isDirty: state.isDirty,
        setHtml,
        getHtml,
        clearDirtyFlag,
        handleInput,
        toggleBold,
        toggleItalic,
        toggleUnderline,
        toggleCode,
        insertLink,
        formatHeading,
        insertBulletList,
        insertNumberedList,
        insertQuote,
        clearFormatting,
    };
}
