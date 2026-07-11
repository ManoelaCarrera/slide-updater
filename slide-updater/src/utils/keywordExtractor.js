/**
 * TF-IDF-based keyword extraction with domain-specific term boosting
 * Specialized for dental oncology and oral pathology terminology
 */
/**
 * Extracts keywords using TF-IDF algorithm with technical term boosting.
 * Specializes in stomatology and head-neck cancer oncology terminology.
 */
export class TFIDFExtractor {
    constructor() {
        Object.defineProperty(this, "stopWords", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set([
                // Portuguese stop words
                'a', 'o', 'e', 'é', 'de', 'do', 'da', 'dos', 'das', 'que', 'em', 'para', 'por',
                'com', 'ao', 'um', 'uma', 'uns', 'umas', 'os', 'as', 'na', 'no', 'nas', 'nos',
                'este', 'esse', 'aquele', 'este', 'esse', 'aquele', 'qual', 'quanto', 'como',
                'quando', 'onde', 'se', 'seu', 'sua', 'seus', 'suas', 'nosso', 'nossa', 'vosso',
                'nossa', 'meu', 'minha', 'teu', 'tua', 'dele', 'dela', 'entre', 'desde', 'até',
                // English stop words
                'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
                'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
                'can', 'in', 'on', 'at', 'by', 'to', 'from', 'and', 'or', 'but', 'of', 'with',
                'as', 'an', 'a', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
                'it', 'we', 'they', 'him', 'her', 'us', 'them', 'his', 'her', 'its', 'their',
                'my', 'your', 'our', 'there', 'here', 'then', 'now', 'also', 'than', 'such',
                'which', 'who', 'what', 'why', 'how', 'all', 'each', 'every', 'both', 'any',
                'some', 'one', 'other', 'no', 'nor', 'not', 'only', 'very', 'just', 'so',
                'up', 'out', 'about', 'over', 'under', 'through', 'during',
            ])
        });
        /**
         * Technical terms with domain-specific boost multipliers (stomatology, oncology).
         * Higher multipliers = higher relevance in domain context.
         */
        Object.defineProperty(this, "technicalTerms", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map([
                // Oral mucositis (mucosite oral)
                ['mucosite', 1.8],
                ['mucositis', 1.8],
                ['mucosite oral', 1.9],
                ['oral mucositis', 1.9],
                ['quimioterapia induzida', 1.6],
                ['radioterapia induzida', 1.6],
                ['lesões orais', 1.5],
                ['úlceras orais', 1.5],
                // Bone necrosis
                ['osteoradionecrose', 1.9],
                ['osteoradionecrosis', 1.9],
                ['osteonecrose', 1.7],
                ['osteonecrosis', 1.7],
                ['necrose avascular', 1.6],
                ['avascular necrosis', 1.6],
                // Xerostomia
                ['xerostomia', 1.8],
                ['hiposalivação', 1.7],
                ['dessecação oral', 1.6],
                ['salivary dysfunction', 1.6],
                ['salivary gland dysfunction', 1.7],
                // Photobiomodulation
                ['fotobiomodulação', 1.8],
                ['photobiomodulation', 1.8],
                ['terapia fotodinâmica', 1.6],
                ['pdterapia', 1.6],
                // Head and neck cancer
                ['câncer de cabeça e pescoço', 1.9],
                ['head and neck cancer', 1.9],
                ['carcinoma espinocelular', 1.7],
                ['squamous cell carcinoma', 1.7],
                ['hnscc', 1.8],
                // Chemotherapy/Radiotherapy
                ['quimioterapia', 1.6],
                ['chemotherapy', 1.6],
                ['radioterapia', 1.6],
                ['radiotherapy', 1.6],
                ['chemoradiotherapy', 1.7],
                ['quimioradioterapia', 1.7],
                // Oncology/Cancer terms
                ['câncer oral', 1.7],
                ['oral cancer', 1.7],
                ['neoplasia', 1.5],
                ['neoplasm', 1.5],
                ['maligno', 1.4],
                ['malignant', 1.4],
                ['tumor', 1.4],
                // Pathology terms
                ['epitélio', 1.4],
                ['epithelium', 1.4],
                ['submucosa', 1.4],
                ['submucous', 1.4],
                ['inflamação', 1.4],
                ['inflammation', 1.4],
                // Molecular biology terms
                ['nf-κb', 1.6],
                ['citocinas', 1.5],
                ['cytokines', 1.5],
                ['pró-inflamatórias', 1.4],
                ['proinflammatory', 1.4],
                // Clinical assessment
                ['avaliação clínica', 1.4],
                ['diagnóstico', 1.3],
                ['diagnosis', 1.3],
                ['prognóstico', 1.3],
                ['prognosis', 1.3],
                // Dental specialties
                ['estomatologia', 1.7],
                ['odontologia', 1.5],
                ['periodontia', 1.4],
                ['periodontology', 1.4],
            ])
        });
    }
    /**
     * Extract top N keywords from text with TF-IDF scoring.
     * @param text - Text to process
     * @param topN - Number of top keywords to return (default: 7)
     * @returns Array of scored keywords sorted by relevance
     */
    extract(text, topN = 7) {
        if (!text || text.trim().length === 0) {
            return [];
        }
        const tokens = this.tokenize(text);
        const termFrequency = this.calculateTermFrequency(tokens);
        const scores = this.calculateTFIDF(termFrequency, text);
        const boostedScores = this.applyTechnicalBoost(scores);
        return boostedScores
            .sort((a, b) => b.score - a.score)
            .slice(0, topN);
    }
    /**
     * Tokenize text: lowercase, split, normalize, filter.
     */
    tokenize(text) {
        return text
            .toLowerCase()
            .split(/[\s\n\t.,;:!?()[\]{}'"«»—–-]+/)
            .filter(token => token.length > 2 && !this.stopWords.has(token));
    }
    /**
     * Calculate term frequency (TF) for each unique term.
     */
    calculateTermFrequency(tokens) {
        const tf = new Map();
        for (const token of tokens) {
            tf.set(token, (tf.get(token) || 0) + 1);
        }
        return tf;
    }
    /**
     * Calculate TF-IDF scores: TF * log(1 + IDF).
     * Inverse document frequency is simplified as log-normalized uniqueness.
     */
    calculateTFIDF(termFrequency, originalText) {
        const scores = [];
        const totalTokens = Array.from(termFrequency.values()).reduce((a, b) => a + b, 1);
        for (const [term, freq] of termFrequency.entries()) {
            // TF = frequency / total tokens
            const tf = freq / totalTokens;
            // IDF = log(total tokens / frequency)
            // Simplified: log(1 + diversity_factor)
            const idf = Math.log(1 + totalTokens / freq);
            // TF-IDF = TF * IDF
            const score = tf * idf;
            scores.push({
                term,
                score,
                frequency: freq,
                idf,
            });
        }
        return scores;
    }
    /**
     * Apply domain-specific boost to technical terms.
     */
    applyTechnicalBoost(scores) {
        return scores.map(score => {
            // Direct term match
            let boost = this.technicalTerms.get(score.term) || 1.0;
            // Substring match for multi-word terms
            if (boost === 1.0) {
                for (const [technicalTerm, multiplier] of this.technicalTerms.entries()) {
                    if (technicalTerm.includes(score.term) && score.term.length > 4) {
                        boost = multiplier * 0.8; // Slightly reduced for substring match
                        break;
                    }
                }
            }
            return {
                ...score,
                score: score.score * boost,
            };
        });
    }
}
/**
 * Convenience function: extract keywords from text using TF-IDF.
 * @param text - Input text
 * @param topN - Number of top keywords (default: 7)
 * @returns Array of scored keywords
 */
export function extractKeywords(text, topN = 7) {
    return new TFIDFExtractor().extract(text, topN);
}
/**
 * Get only the terms (without scores) for compatibility.
 * @param text - Input text
 * @param topN - Number of top keywords
 * @returns Array of keyword strings
 */
export function extractKeywordTerms(text, topN = 7) {
    return extractKeywords(text, topN).map(kw => kw.term);
}
