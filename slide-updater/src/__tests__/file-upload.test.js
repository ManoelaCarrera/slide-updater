/**
 * Teste de Upload Real de PDF/PPTX
 *
 * MANUAL TEST PLAN:
 * 1. Criar projeto novo
 * 2. Importar arquivo TXT com 3 linhas → 3 slides criados
 * 3. Importar arquivo PDF (2 páginas) → 2 slides criados
 * 4. Verificar que originalContent preservado
 * 5. Verificar que contentLength calculado
 * 6. Testar erro gracioso em arquivo inválido
 */
export const fileUploadTests = [
    {
        name: 'Upload TXT — 3 lines = 3 slides',
        fileType: 'txt',
        input: `Mucosite oral: definição
Fatores de risco em câncer de cabeça e pescoço
Métodos de prevenção com fotobiomodulação`,
        steps: [
            'Create new project "UploadTest"',
            'Open FileUpload modal',
            'Drag TXT file with 3 lines to upload area',
            'Wait for processing to complete',
            'Verify 3 slides created in sidebar',
        ],
        expectedResult: '3 slides created, each with title and content',
        severity: 'critical',
    },
    {
        name: 'Upload TXT — Preserve originalContent',
        fileType: 'txt',
        input: 'Osteoradionecrose dos maxilares',
        steps: [
            'Upload single-line TXT file',
            'Click first slide in sidebar',
            'Open DevTools → Console',
            'Log: getCurrentSlide().originalContent',
            'Verify matches original input',
        ],
        expectedResult: 'slide.originalContent === original line',
        severity: 'high',
    },
    {
        name: 'Upload TXT — Calculate contentLength',
        fileType: 'txt',
        input: 'Word1 Word2 Word3 Word4 Word5',
        steps: [
            'Upload TXT with 5 words',
            'Select slide',
            'Check slide metadata',
            'Verify contentLength === 5',
        ],
        expectedResult: 'contentLength calculated as word count',
        severity: 'medium',
    },
    {
        name: 'Upload PDF — Fallback parsing (simple)',
        fileType: 'pdf',
        input: 'Page 1 content\n\nPage 2 content',
        steps: [
            'Create simple PDF (2 pages or sections)',
            'Open FileUpload modal',
            'Drag PDF to upload area',
            'Wait for processing',
            'Verify slides created (may be different from pages if parser fails)',
            'Check for error toast if PDF parsing unavailable',
        ],
        expectedResult: 'Slides created or graceful error message',
        severity: 'high',
    },
    {
        name: 'Upload PPTX — Requires dependency',
        fileType: 'pptx',
        input: 'Sample PPTX file',
        steps: [
            'Create simple PPTX (2 slides)',
            'Drag PPTX to upload area',
            'Wait for processing',
            'Check toast notification',
        ],
        expectedResult: 'Error message: "Erro ao processar PPTX. Certifique-se de que a dependência docx está instalada."',
        severity: 'high',
    },
    {
        name: 'Upload Invalid File — Graceful Error',
        fileType: 'invalid',
        input: 'Binary content',
        steps: [
            'Try to upload .exe or .bin file',
            'Observe UI response',
        ],
        expectedResult: 'Error toast: "Formato de arquivo não suportado: file.exe"',
        severity: 'medium',
    },
    {
        name: 'Upload Empty File — Error Handling',
        fileType: 'txt',
        input: '',
        steps: [
            'Create empty TXT file',
            'Upload it',
            'Wait for processing',
        ],
        expectedResult: 'Error toast: "Arquivo vazio ou inválido"',
        severity: 'medium',
    },
    {
        name: 'File Upload UI — Loading State',
        fileType: 'txt',
        input: 'Test content',
        steps: [
            'Drag file to upload area',
            'Immediately check UI',
            'Verify isProcessing state reflected:',
            '  - Upload area shows "Processando..."',
            '  - Button shows loading spinner',
            '  - Drop area disabled/opaque',
        ],
        expectedResult: 'UI shows loading state while processing',
        severity: 'high',
    },
    {
        name: 'File Upload — Multiple Files',
        fileType: 'txt',
        input: 'File1 content',
        steps: [
            'Select multiple TXT files',
            'Upload all at once',
            'Verify all processed sequentially',
        ],
        expectedResult: 'All files processed, all slides created',
        severity: 'medium',
    },
    {
        name: 'Drag and Drop — UI Feedback',
        fileType: 'txt',
        input: 'Test',
        steps: [
            'Hover file over upload area (drag over)',
            'Verify visual feedback: border-primary-600, bg-primary-50',
            'Drag out (drag leave)',
            'Verify styles removed',
        ],
        expectedResult: 'Visual feedback on drag over/leave',
        severity: 'medium',
    },
];
export const fileUploadChecklist = {
    implementation: {
        'fileParserService.ts created': true,
        'parseFile() dispatcher implemented': true,
        'parsePDFFile() implemented (with fallback)': true,
        'parsePPTXFile() placeholder (needs docx)': true,
        'parseTextFile() implemented': true,
        'createSlidesFromParsedData() implemented': true,
        'Error handling with specific messages': true,
    },
    fileUploadComponent: {
        'isProcessing state added': true,
        'Loading spinner shown during processing': true,
        'Drag and drop UI feedback (hover effects)': true,
        'File input accepts .txt, .pdf, .pptx': true,
        'Multiple file handling': true,
        'Error toasts displayed': true,
    },
    behavior: {
        'TXT: 1 line = 1 slide': true,
        'PDF: fallback simple parser': true,
        'PPTX: graceful error until docx installed': true,
        'originalContent preserved': true,
        'contentLength calculated': true,
        'Empty file → error': true,
        'Invalid format → error': true,
    },
    ui: {
        'isProcessing disables drop area': true,
        'isProcessing shows loading text': true,
        'Help text updated (TXT/PDF/PPTX)': true,
        'Error messages specific': true,
    },
};
export const fileFormatSupport = {
    txt: {
        status: 'fully_supported',
        parser: 'parseTextFile()',
        behavior: '1 line = 1 slide',
        notes: 'Each line becomes slide title + content',
    },
    pdf: {
        status: 'fallback_supported',
        parser: 'parsePDFFile()',
        behavior: 'Splits by double newlines (fallback)',
        notes: 'Full PDF parsing requires pdfjs-dist library',
        todo: 'Install pdfjs-dist for real PDF extraction',
    },
    pptx: {
        status: 'not_yet_supported',
        parser: 'parsePPTXFile()',
        behavior: 'Returns error with installation instructions',
        notes: 'Requires docx library for parsing .pptx files',
        todo: 'Install docx library to enable PPTX parsing',
    },
};
