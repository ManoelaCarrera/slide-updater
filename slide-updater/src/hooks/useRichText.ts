import { useState, useRef, useCallback } from 'react'

export interface RichTextState {
  html: string
  isDirty: boolean
}

export function useRichText(initialHtml: string = '') {
  const [state, setState] = useState<RichTextState>({
    html: initialHtml,
    isDirty: false,
  })
  const editorRef = useRef<HTMLDivElement>(null)

  const setHtml = useCallback((html: string) => {
    setState({ html, isDirty: true })
    if (editorRef.current) {
      editorRef.current.innerHTML = html
    }
  }, [])

  const getHtml = useCallback((): string => {
    return editorRef.current?.innerHTML || state.html
  }, [state.html])

  const clearDirtyFlag = useCallback(() => {
    setState(prev => ({ ...prev, isDirty: false }))
  }, [])

  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      setState({
        html: editorRef.current.innerHTML,
        isDirty: true,
      })
    }
  }, [])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      setState({
        html: editorRef.current.innerHTML,
        isDirty: true,
      })
    }
  }, [])

  const toggleBold = useCallback(() => {
    executeCommand('bold')
  }, [executeCommand])

  const toggleItalic = useCallback(() => {
    executeCommand('italic')
  }, [executeCommand])

  const toggleUnderline = useCallback(() => {
    executeCommand('underline')
  }, [executeCommand])

  const toggleCode = useCallback(() => {
    executeCommand('formatBlock', '<code>')
  }, [executeCommand])

  const insertLink = useCallback((url: string) => {
    executeCommand('createLink', url)
  }, [executeCommand])

  const formatHeading = useCallback((level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => {
    executeCommand('formatBlock', `<${level}>`)
  }, [executeCommand])

  const insertBulletList = useCallback(() => {
    executeCommand('insertUnorderedList')
  }, [executeCommand])

  const insertNumberedList = useCallback(() => {
    executeCommand('insertOrderedList')
  }, [executeCommand])

  const insertQuote = useCallback(() => {
    executeCommand('formatBlock', '<blockquote>')
  }, [executeCommand])

  const clearFormatting = useCallback(() => {
    executeCommand('removeFormat')
  }, [executeCommand])

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
  }
}
