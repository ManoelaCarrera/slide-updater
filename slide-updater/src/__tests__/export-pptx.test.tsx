/**
 * Plano de teste manual — Exportação PPTX (v2.0)
 *
 * Não há test runner configurado neste projeto (sem vitest/jest). Este
 * arquivo documenta o plano de teste e é validado por `tsc` (parte de
 * `npm run build`) — qualquer refatoração que quebre o contrato de tipos
 * usado aqui vai falhar o build.
 *
 * MANUAL TEST PLAN:
 * 1. Criar projeto com 2 slides
 * 2. Adicionar 1 fonte (PDF ou .txt) com conteúdo relacionado ao slide
 * 3. Rodar "Analisar Este Slide", aprovar 2 sugestões (Modo A ou B)
 * 4. Exportar como PPTX
 * 5. Abrir em PowerPoint/LibreOffice e validar:
 *    - Cores corretas (terracota + marrom + bege)
 *    - Apenas as sugestões aprovadas (appliedChanges) aparecem como referência
 *    - Números do slide no rodapé
 *    - Layout profissional, texto não cortado
 */

interface ExportTestCase {
  name: string
  steps: string[]
  expectedResult: string
  severity: 'critical' | 'high' | 'medium'
}

export const exportPPTXTests: ExportTestCase[] = [
  {
    name: 'Export PPTX — Estrutura básica',
    steps: [
      'Criar projeto com 2 slides',
      'Clicar "📊 Exportar como PPTX"',
      'Arquivo baixa como: NomeDoProjeto-YYYY-MM-DD.pptx',
      'Abrir em PowerPoint/LibreOffice',
      'Verificar 2 slides presentes',
    ],
    expectedResult: 'Arquivo PPTX criado com 2 slides',
    severity: 'critical',
  },
  {
    name: 'Export PPTX — Cor do título (terracota)',
    steps: [
      'Criar slide com título "Mucosite Oral"',
      'Exportar PPTX',
      'Selecionar o texto do título',
      'Checar cor',
    ],
    expectedResult: 'Cor do título é #C17847 (terracota), 32pt, negrito',
    severity: 'high',
  },
  {
    name: 'Export PPTX — Cor do conteúdo (marrom escuro)',
    steps: ['Criar slide com conteúdo', 'Exportar PPTX', 'Selecionar o texto do conteúdo', 'Checar cor'],
    expectedResult: 'Cor do conteúdo é #2C2416 (marrom escuro), 14pt',
    severity: 'high',
  },
  {
    name: 'Export PPTX — Cor de fundo (bege)',
    steps: ['Exportar PPTX', 'Clicar no fundo do slide', 'Checar cor de preenchimento'],
    expectedResult: 'Cor de fundo é #FAF8F5 (bege/off-white)',
    severity: 'high',
  },
  {
    name: 'Export PPTX — Linha decorativa sob o título',
    steps: ['Exportar PPTX', 'Observar linha abaixo do título em cada slide'],
    expectedResult: 'Retângulo terracota de 1.5" de largura sob o título',
    severity: 'high',
  },
  {
    name: 'Export PPTX — Apenas sugestões aplicadas viram referência',
    steps: [
      'Criar slide, rodar análise contra 1 fonte',
      'Aprovar 2 de 4 sugestões pendentes (via Modo A ou B)',
      'Exportar PPTX',
      'Abrir a seção "Referências Utilizadas"',
    ],
    expectedResult: 'Apenas as 2 sugestões aplicadas (appliedChanges) aparecem — não as pendentes/rejeitadas',
    severity: 'critical',
  },
  {
    name: 'Export PPTX — Numeração de slides (rodapé)',
    steps: ['Criar projeto com 3 slides', 'Exportar PPTX', 'Checar canto inferior direito de cada slide'],
    expectedResult: 'Números 1, 2, 3 aparecem no rodapé de cada slide',
    severity: 'high',
  },
  {
    name: 'Export PPTX — Fonte consistente (Calibri)',
    steps: ['Exportar PPTX', 'Selecionar texto em múltiplos slides', 'Checar propriedade de fonte'],
    expectedResult: 'Todo o texto usa a fonte Calibri',
    severity: 'medium',
  },
  {
    name: 'Export PPTX — Sem seção de referências quando nada foi aplicado',
    steps: ['Criar slide sem nenhuma sugestão aprovada', 'Exportar PPTX'],
    expectedResult: 'Seção "Referências Utilizadas" não aparece nesse slide',
    severity: 'high',
  },
  {
    name: 'Export PPTX — Nome do arquivo inclui a data',
    steps: ['Exportar PPTX', 'Checar nome do arquivo baixado'],
    expectedResult: 'Formato: NomeDoProjeto-YYYY-MM-DD.pptx',
    severity: 'medium',
  },
  {
    name: 'Export PPTX — Toast de sucesso',
    steps: ['Clicar "📊 Exportar como PPTX"', 'Aguardar conclusão', 'Observar notificação'],
    expectedResult: 'Toast mostra: "Exportado como PPTX com sucesso!"',
    severity: 'medium',
  },
  {
    name: 'Export PPTX — Tratamento de erro',
    steps: ['Simular falha na geração (ex.: projeto corrompido)', 'Tentar exportar PPTX'],
    expectedResult: 'Toast mostra: "Erro ao exportar PPTX. Tente novamente."',
    severity: 'medium',
  },
  {
    name: 'Export PPTX — Conteúdo com rich text (negrito/itálico/listas)',
    steps: ['Formatar conteúdo com negrito, lista e citação no editor', 'Exportar PPTX'],
    expectedResult: 'Conteúdo exportado como texto simples (tags HTML removidas), legível, não cortado',
    severity: 'medium',
  },
]

export const exportPPTXDesignSystem = {
  colors: {
    primary: '#c17847', // terracota
    secondary: '#2c2416', // marrom escuro
    background: '#faf8f5', // bege/off-white
    referenceText: '#666666',
    footerText: '#999999',
  },
  typography: {
    title: { font: 'Calibri', size: 32, bold: true, color: '#c17847' },
    content: { font: 'Calibri', size: 14, color: '#2c2416' },
    referencesTitle: { font: 'Calibri', size: 11, bold: true, color: '#c17847' },
    referencesText: { font: 'Calibri', size: 9, color: '#666666' },
    footer: { font: 'Calibri', size: 10, color: '#999999' },
  },
}

export const exportPPTXChecklist = {
  implementation: {
    'exportProjectToPPTX() em services/exportService.ts': true,
    'Cores do design system aplicadas': true,
    'Título formatado (32pt, negrito, terracota)': true,
    'Linha decorativa sob o título': true,
    'Conteúdo formatado (14pt, marrom)': true,
    'Fundo bege': true,
    'Filtro: apenas appliedChanges (sugestões aplicadas)': true,
    'Numeração de slide no rodapé': true,
    'Tratamento de erro com toast': true,
  },
  ui: {
    'Botão de exportar no ExportPanel': true,
    'Loading state durante exportação': true,
    'Toast de sucesso/erro': true,
  },
}
