/**
 * Teste de Exportação PPTX Funcional
 *
 * MANUAL TEST PLAN:
 * 1. Criar projeto com 2 slides
 * 2. Adicionar 4 artigos de literatura
 * 3. Aprovar 2 artigos (checkbox)
 * 4. Exportar como PPTX
 * 5. Abrir em PowerPoint/LibreOffice e validar:
 *    - Cores corretas (terracota + marrom + bege)
 *    - Apenas 2 referências aprovadas aparecem
 *    - Números do slide no rodapé
 *    - Layout profissional
 */
export const exportPPTXTests = [
    {
        name: 'Export PPTX — Basic Structure',
        steps: [
            'Create project with 2 slides',
            'Click "📊 Exportar como PPTX"',
            'File downloads as: ProjectName-YYYY-MM-DD.pptx',
            'Open in PowerPoint/LibreOffice',
            'Verify 2 slides present',
        ],
        expectedResult: 'PPTX file created with 2 slides',
        severity: 'critical',
    },
    {
        name: 'Export PPTX — Title Color (Terracota)',
        steps: [
            'Create project + 1 slide with title "Mucosite Oral"',
            'Export PPTX',
            'Open in PowerPoint',
            'Select title text on slide',
            'Check color properties',
        ],
        expectedResult: 'Title color is #c17847 (terracota), 36pt, bold',
        severity: 'high',
    },
    {
        name: 'Export PPTX — Content Color (Marrom)',
        steps: [
            'Create slide with content text',
            'Export PPTX',
            'Open in PowerPoint',
            'Select content text',
            'Check color properties',
        ],
        expectedResult: 'Content color is #2c2416 (marrom escuro), 14pt',
        severity: 'high',
    },
    {
        name: 'Export PPTX — Background Color (Bege)',
        steps: [
            'Export PPTX',
            'Open in PowerPoint',
            'Click slide background',
            'Check fill color',
        ],
        expectedResult: 'Background color is #faf8f5 (off-white/bege)',
        severity: 'high',
    },
    {
        name: 'Export PPTX — Title Decorative Line',
        steps: [
            'Export PPTX',
            'Open in PowerPoint',
            'Look under title on each slide',
            'Observe line beneath title',
        ],
        expectedResult: '1.5" wide terracota line under each title',
        severity: 'high',
    },
    {
        name: 'Export PPTX — Only Approved Literature',
        steps: [
            'Create slide',
            'Add 4 literature items via PubMed search',
            'Approve only 2 items (checkbox)',
            'Export PPTX',
            'Open in PowerPoint',
            'Look at "Referências Utilizadas" section',
        ],
        expectedResult: 'Only 2 approved references appear in PPTX (not 4)',
        severity: 'critical',
    },
    {
        name: 'Export PPTX — Reference Format',
        steps: [
            'Add 1 approved article:',
            '  Title: "Photobiomodulation for Oral Mucositis"',
            '  Authors: "Smith J, Doe A"',
            '  Year: 2022',
            'Export PPTX',
            'Open and check references section',
        ],
        expectedResult: 'Format: "Smith J, Doe A (2022). Photobiomodulation for Oral Mucositis"',
        severity: 'high',
    },
    {
        name: 'Export PPTX — Slide Numbering (Footer)',
        steps: [
            'Create project with 3 slides',
            'Export PPTX',
            'Open in PowerPoint',
            'Check bottom right of each slide',
        ],
        expectedResult: 'Slide numbers 1, 2, 3 appear in bottom right corner',
        severity: 'high',
    },
    {
        name: 'Export PPTX — Font Consistency',
        steps: [
            'Export PPTX',
            'Open in PowerPoint',
            'Select text on multiple slides',
            'Check font property',
        ],
        expectedResult: 'All text uses Calibri font',
        severity: 'medium',
    },
    {
        name: 'Export PPTX — No Unapproved Literature',
        steps: [
            'Create slide',
            'Add 3 literature items',
            'Approve NONE (leave all unchecked)',
            'Export PPTX',
            'Open in PowerPoint',
        ],
        expectedResult: '"Referências Utilizadas" section not present (empty)',
        severity: 'high',
    },
    {
        name: 'Export PPTX — Filename Includes Date',
        steps: [
            'Export PPTX',
            'Check download filename',
        ],
        expectedResult: 'Filename format: ProjectName-YYYY-MM-DD.pptx',
        severity: 'medium',
    },
    {
        name: 'Export PPTX — Success Toast',
        steps: [
            'Click "📊 Exportar como PPTX"',
            'Wait for export to complete',
            'Observe notification',
        ],
        expectedResult: 'Toast shows: "Exportado como PPTX com sucesso!"',
        severity: 'medium',
    },
    {
        name: 'Export PPTX — Error Handling (pptxgen unavailable)',
        steps: [
            'Simulate pptxgen not loaded',
            'Try to export PPTX',
            'Check error message',
        ],
        expectedResult: 'Toast shows: "Erro: pptxgen não disponível. Tente novamente."',
        severity: 'medium',
    },
    {
        name: 'Export PPTX — Text Wrapping',
        steps: [
            'Create slide with long content (200+ words)',
            'Export PPTX',
            'Open in PowerPoint',
            'Check that content wraps within slide bounds',
        ],
        expectedResult: 'Content wraps cleanly, not cut off',
        severity: 'medium',
    },
    {
        name: 'Export PPTX — Multiple Slides Layout',
        steps: [
            'Create project with 5 slides',
            'Add different content to each',
            'Export PPTX',
            'Open and verify all 5 slides have consistent formatting',
        ],
        expectedResult: 'All slides use same design system, layout consistent',
        severity: 'high',
    },
];
export const exportPPTXDesignSystem = {
    colors: {
        primary: '#c17847', // terracota
        secondary: '#2c2416', // marrom escuro
        background: '#faf8f5', // bege/off-white
        reference_text: '#666666', // cinza médio
        footer_text: '#999999', // cinza claro
    },
    typography: {
        title: {
            font: 'Calibri',
            size: 36,
            bold: true,
            color: '#c17847',
            alignment: 'left',
        },
        content: {
            font: 'Calibri',
            size: 14,
            color: '#2c2416',
            alignment: 'left',
            lineSpacing: 20,
        },
        references_title: {
            font: 'Calibri',
            size: 11,
            bold: true,
            color: '#c17847',
        },
        references_text: {
            font: 'Calibri',
            size: 9,
            color: '#666666',
            lineSpacing: 14,
        },
        footer: {
            font: 'Calibri',
            size: 10,
            color: '#999999',
            alignment: 'right',
        },
    },
    layout: {
        title_x: 0.5,
        title_y: 0.4,
        title_width: 8.5,
        title_height: 0.7,
        title_line_width: 1.5,
        title_line_y: 1.15,
        content_x: 0.5,
        content_y: 1.5,
        content_width: 8.5,
        content_height: 4.2,
        references_start_y: 5.8,
        footer_x: 8.8,
        footer_y: 6.8,
        footer_width: 0.5,
        footer_height: 0.3,
    },
};
export const exportPPTXChecklist = {
    implementation: {
        'exportToPPTX() refactored': true,
        'Design system colors applied': true,
        'Title formatting (36pt, bold, terracota)': true,
        'Decorative line under title': true,
        'Content formatting (14pt, marrom)': true,
        'Background color (bege)': true,
        'Filter: approved literature only': true,
        'Reference format standardized': true,
        'Slide numbering in footer': true,
        'Error handling for missing pptxgen': true,
    },
    ui: {
        'Export button in ExportPanel': true,
        'Loading state during export': true,
        'Success toast on completion': true,
        'Error toast on failure': true,
    },
    output: {
        'PPTX file downloads': true,
        'Filename includes date': true,
        'All slides present': true,
        'Consistent formatting across slides': true,
        'Only approved literature in output': true,
        'Design system respected': true,
    },
    quality: {
        'Professional appearance': true,
        'Text readable (not cut off)': true,
        'Colors match design system': true,
        'References properly formatted': true,
        'Slide numbers visible': true,
    },
};
export const exportPPTXValidationScript = `
// Run in PowerPoint/LibreOffice via macro or manual inspection:

// 1. Check colors
const slide = presentation.slides[0]
const titleShape = slide.shapes[0]
console.log('Title color:', titleShape.textFrame.paragraphs[0].runs[0].font.color.rgb)
// Expected: c17847

// 2. Check approved literature only
const hasUnapprovedLit = slide.notes.includes('unapproved')
console.log('Contains unapproved literature:', hasUnapprovedLit)
// Expected: false

// 3. Check slide numbering
const footerShape = slide.shapes.find(s => s.name.includes('footer'))
console.log('Footer text:', footerShape.textFrame.text)
// Expected: "1", "2", "3", etc.

// 4. Validate text isn't cut off
slide.shapes.forEach(shape => {
  if (shape.type === 'text') {
    console.log('Text overflowed:', shape.textFrame.overflowed)
  }
})
// Expected: all false
`;
