import { useEffect, useState } from 'react';
import { useRichText } from '../hooks/useRichText';
import { Button } from './Button';
export function RichTextEditor({ value, onChange, placeholder = 'Digite ou cole o conteúdo do slide...', disabled = false, }) {
    const richText = useRichText(value);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [selectedHeading, setSelectedHeading] = useState('h2');
    // Initialize editor with initial value
    useEffect(() => {
        if (richText.editorRef.current && value && richText.editorRef.current.innerHTML !== value) {
            richText.editorRef.current.innerHTML = value;
        }
    }, []);
    // Propagate changes to parent
    useEffect(() => {
        if (richText.isDirty) {
            onChange(richText.getHtml());
            richText.clearDirtyFlag();
        }
    }, [richText.isDirty, richText, onChange]);
    const handleInsertLink = () => {
        if (linkUrl.trim()) {
            richText.insertLink(linkUrl);
            setLinkUrl('');
            setShowLinkInput(false);
        }
    };
    const handleHeadingChange = (e) => {
        const level = e.target.value;
        setSelectedHeading(level);
        richText.formatHeading(level);
    };
    return (<div className="flex flex-col gap-3 border border-neutral-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-neutral-50 border-b border-neutral-200 p-3 flex flex-wrap gap-1 items-center">
        {/* Text formatting */}
        <Button size="sm" variant="ghost" onClick={richText.toggleBold} title="Bold (Ctrl+B)" aria-label="Aplicar negrito">
          <strong>B</strong>
        </Button>

        <Button size="sm" variant="ghost" onClick={richText.toggleItalic} title="Italic (Ctrl+I)" aria-label="Aplicar itálico">
          <em>I</em>
        </Button>

        <Button size="sm" variant="ghost" onClick={richText.toggleUnderline} title="Underline (Ctrl+U)" aria-label="Aplicar sublinhado">
          <u>U</u>
        </Button>

        <Button size="sm" variant="ghost" onClick={richText.toggleCode} title="Code" aria-label="Aplicar formatação de código">
          &lt;/&gt;
        </Button>

        <div className="w-px h-6 bg-neutral-300"/>

        {/* Headings */}
        <select value={selectedHeading} onChange={handleHeadingChange} className="px-2 py-1 text-sm border border-neutral-200 rounded bg-white hover:bg-neutral-100 cursor-pointer" aria-label="Selecionar nível de título" disabled={disabled}>
          <option value="h2">Título H2</option>
          <option value="h3">Título H3</option>
          <option value="h4">Título H4</option>
        </select>

        <div className="w-px h-6 bg-neutral-300"/>

        {/* Lists */}
        <Button size="sm" variant="ghost" onClick={richText.insertBulletList} title="Bullet list" aria-label="Inserir lista com pontos">
          • Lista
        </Button>

        <Button size="sm" variant="ghost" onClick={richText.insertNumberedList} title="Numbered list" aria-label="Inserir lista numerada">
          1. Lista
        </Button>

        <div className="w-px h-6 bg-neutral-300"/>

        {/* Link & Quote */}
        <Button size="sm" variant="ghost" onClick={() => setShowLinkInput(!showLinkInput)} title="Insert link" aria-label="Inserir link">
          🔗 Link
        </Button>

        <Button size="sm" variant="ghost" onClick={richText.insertQuote} title="Quote" aria-label="Inserir citação">
          " Citação
        </Button>

        <div className="w-px h-6 bg-neutral-300"/>

        {/* Clear formatting */}
        <Button size="sm" variant="ghost" onClick={richText.clearFormatting} title="Clear formatting" aria-label="Remover formatação">
          ✖️ Limpar
        </Button>
      </div>

      {/* Link input (conditional) */}
      {showLinkInput && (<div className="bg-blue-50 border-b border-blue-200 px-3 py-2 flex gap-2 items-center">
          <input type="text" placeholder="Cole a URL..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleInsertLink()} className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm" aria-label="URL do link" disabled={disabled}/>
          <Button size="sm" variant="primary" onClick={handleInsertLink} aria-label="Confirmar inserção de link" disabled={disabled}>
            OK
          </Button>
          <Button size="sm" variant="ghost" onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
            }} aria-label="Cancelar inserção de link">
            ✕
          </Button>
        </div>)}

      {/* Editor */}
      <div ref={richText.editorRef} contentEditable={!disabled} onInput={richText.handleInput} suppressContentEditableWarning className="flex-1 p-3 min-h-64 outline-none focus:ring-2 focus:ring-primary-600 prose prose-sm max-w-none
          [&]:text-neutral-900 [&_p]:mb-2 [&_ul]:ml-4 [&_ol]:ml-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary-600
          [&_blockquote]:bg-neutral-50 [&_blockquote]:pl-3 [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:rounded" data-placeholder={placeholder} role="textbox" aria-label="Editor de texto rico" aria-multiline="true" aria-disabled={disabled}/>

      {/* Character count */}
      <div className="bg-neutral-50 border-t border-neutral-200 px-3 py-2 text-xs text-neutral-600 flex justify-between">
        <span>{richText.getHtml().replace(/<[^>]*>/g, '').length} caracteres</span>
        <span>{richText.getHtml().replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length} palavras</span>
      </div>
    </div>);
}
