/**
 * Plano de teste manual — Upload de aula base e de fontes (v2.0)
 *
 * Sem test runner configurado (sem vitest/jest); este arquivo documenta o
 * plano de teste e é validado por `tsc` como parte de `npm run build`.
 *
 * Dois fluxos de upload distintos:
 * - Aula base (FileUpload.tsx → fileParserService.ts): .txt/.md vira slides
 * - Fontes de referência (SourceManager.tsx → sourceService.ts): PDF/imagem/.txt/.md
 *   vira Source, com extração de texto local (pdf.js para PDF)
 */

interface UploadTestCase {
  name: string
  fileType: 'txt' | 'md' | 'pdf' | 'image' | 'pptx' | 'invalid'
  steps: string[]
  expectedResult: string
  severity: 'critical' | 'high' | 'medium'
}

export const baseFileUploadTests: UploadTestCase[] = [
  {
    name: 'Importar aula base — TXT com 3 linhas = 3 slides',
    fileType: 'txt',
    steps: [
      'Criar projeto novo',
      'Abrir "📤 Importar Aula Base"',
      'Arrastar TXT com 3 linhas',
      'Aguardar processamento',
      'Verificar 3 slides criados na sidebar, em ordem (order 1, 2, 3)',
    ],
    expectedResult: '3 slides criados, cada um com title e currentContent preenchidos',
    severity: 'critical',
  },
  {
    name: 'Importar aula base — preserva originalContent',
    fileType: 'txt',
    steps: [
      'Upload de TXT com uma linha',
      'Selecionar o slide criado',
      'Checar slide.originalContent === slide.currentContent === linha original',
    ],
    expectedResult: 'originalContent nunca é sobrescrito pela edição/sugestões subsequentes',
    severity: 'high',
  },
  {
    name: 'Importar aula base — PPTX não suportado (erro claro)',
    fileType: 'pptx',
    steps: ['Arrastar um .pptx para o upload de aula base'],
    expectedResult:
      'Toast de erro explicando que importação de PPTX não é suportada e sugerindo criar slides manualmente',
    severity: 'high',
  },
  {
    name: 'Importar aula base — arquivo vazio',
    fileType: 'txt',
    steps: ['Upload de TXT vazio'],
    expectedResult: 'Toast: "Arquivo vazio ou inválido"',
    severity: 'medium',
  },
]

export const sourceUploadTests: UploadTestCase[] = [
  {
    name: 'Adicionar fonte — PDF com texto extraído',
    fileType: 'pdf',
    steps: [
      'Abrir "📚 Adicionar Fontes"',
      'Arrastar um PDF com texto selecionável',
      'Aguardar processamento (pdf.js)',
      'Verificar fonte listada com número de páginas',
      'Abrir preview → conferir texto extraído',
    ],
    expectedResult: 'source.metadata.extractedText preenchido; source.metadata.pages > 0',
    severity: 'critical',
  },
  {
    name: 'Adicionar fonte — PDF escaneado sem texto',
    fileType: 'pdf',
    steps: ['Upload de PDF que é apenas imagem escaneada (sem camada de texto)'],
    expectedResult:
      'Toast de erro explicando que não foi possível extrair texto (pode ser scan sem OCR) — fonte não é adicionada',
    severity: 'high',
  },
  {
    name: 'Adicionar fonte — Imagem (screenshot de livro digital)',
    fileType: 'image',
    steps: ['Upload de .png ou .jpg', 'Verificar fonte listada como tipo "image"', 'Abrir preview → ver a imagem'],
    expectedResult: 'source.metadata.dataUrl preenchido; preview mostra a imagem',
    severity: 'high',
  },
  {
    name: 'Adicionar fonte — .txt e .md',
    fileType: 'txt',
    steps: ['Upload de .txt e de .md com notas'],
    expectedResult: 'Ambos viram source do tipo correspondente, com extractedText = conteúdo do arquivo',
    severity: 'high',
  },
  {
    name: 'Adicionar fonte — arquivo inválido',
    fileType: 'invalid',
    steps: ['Tentar subir um .exe ou .bin'],
    expectedResult: 'Toast: "Formato não suportado: arquivo.exe. Use PDF, imagem, .txt ou .md."',
    severity: 'medium',
  },
  {
    name: 'Adicionar fonte — múltiplos arquivos de uma vez',
    fileType: 'pdf',
    steps: ['Selecionar 3 arquivos (PDF + txt + imagem) de uma vez no input'],
    expectedResult: 'Os 3 são processados e listados; erros individuais não bloqueiam os demais',
    severity: 'medium',
  },
  {
    name: 'Remover fonte — descarta sugestões pendentes associadas',
    fileType: 'pdf',
    steps: [
      'Adicionar fonte, rodar análise em um slide (gera sugestões pendentes dessa fonte)',
      'Remover a fonte pela sidebar',
    ],
    expectedResult: 'Sugestões pendentes vindas dessa fonte somem da lista; sugestões já aprovadas permanecem no histórico',
    severity: 'medium',
  },
]

export const fileFormatSupport = {
  baseFile: {
    txt: { status: 'suportado', behavior: 'uma linha = um slide' },
    md: { status: 'suportado', behavior: 'uma linha = um slide' },
    pptx: { status: 'não suportado', notes: 'crie os slides manualmente; exportação para PPTX funciona' },
  },
  source: {
    pdf: { status: 'suportado', parser: 'pdfService.extractTextFromPdf (pdf.js)', notes: 'sem OCR para scans' },
    image: { status: 'suportado', notes: 'sem OCR — usada como preview visual, não entra na busca textual' },
    txt: { status: 'suportado' },
    md: { status: 'suportado' },
  },
}
