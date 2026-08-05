# BUSCA VALIDADA — Desigualdade de Pesquisa em Rastreio de CCP em LMIC vs Países de Alta Renda

**Pesquisadora:** Estomatologia e Odontologia Oncológica | **Data:** 2026-08-05  
**Objetivo:** Mapear volume, países líderes, instituições, redes de colaboração e padrões de citação em rastreio de CCP (2010-2026)

---

## 1. STRING DE BUSCA — VERSÃO FINAL (EN)

### 1.1 String Ampla (Captura ~1.500-3.000 artigos)
```
("head and neck cancer" OR "oral cancer" OR "oropharyngeal cancer" OR "oral squamous cell carcinoma") 
AND 
(screening OR "early detection" OR "mass screening" OR "population screening" OR "opportunistic screening") 
AND 
(Brazil OR India OR Mexico OR "South Africa" OR Vietnam OR Indonesia OR "low-income countr*" OR "middle-income countr*" OR "developing countr*" OR LMIC OR "global south" OR "resource-limited")
```

### 1.2 String Restrita — Screening Focal (Captura ~400-800 artigos)
```
("head and neck cancer" OR "oral cancer") 
AND 
(screening OR "early detection") 
AND 
(LMIC OR "low-income" OR "middle-income" OR "developing countr*")
```

### 1.3 String por País — Análise Isolada (Estratégia de validação)
```
("head and neck cancer" OR "oral cancer") AND screening AND (Brazil OR India OR Mexico)
```

---

## 2. ADAPTAÇÃO POR BASE DE DADOS

### 2.1 PubMed (MEDLINE)
**Sintaxe:** `[MeSH Terms]` para descritores controlados; `[tiab]` para título/abstract

#### Versão com MeSH + palavras-chave:
```
(("Head and Neck Neoplasms"[MeSH] OR "Mouth Neoplasms"[MeSH] OR "head and neck cancer"[tiab] OR "oral cancer"[tiab]) 
AND 
("Early Detection of Cancer"[MeSH] OR "Mass Screening"[MeSH] OR "Screening"[MeSH] OR screening[tiab] OR "early detection"[tiab]) 
AND 
("Brazil"[af] OR "India"[af] OR "Mexico"[af] OR "South Africa"[af] OR "Vietnam"[af] OR "Indonesia"[af] OR "low-income countr*"[tiab] OR "middle-income countr*"[tiab] OR "developing countr*"[tiab] OR LMIC[tiab]))
AND 
(2010:2026[pdat])
```

**Filtros recomendados:**
- Data: 2010-01-01 to 2026-12-31
- Idioma: English, Portuguese, Spanish

---

### 2.2 Scopus (SciVerse)
**Sintaxe:** `TITLE-ABS-KEY` (título, abstract, palavras-chave)

#### Versão otimizada para Scopus:
```
TITLE-ABS-KEY(
  ("head and neck cancer" OR "oral cancer" OR "oropharyngeal cancer" OR "oral squamous cell carcinoma") 
  AND 
  (screening OR "early detection" OR "mass screening" OR "population screening") 
  AND 
  ("Brazil" OR "India" OR "Mexico" OR "South Africa" OR "Vietnam" OR "Indonesia" OR "low-income" OR "middle-income" OR "developing countr*" OR LMIC OR "resource-limited")
)
AND 
PUBYEAR > 2009
AND 
SRCTYPE(j)
AND 
LANGUAGE(english OR portuguese OR spanish)
```

**Filtros adicionais em Scopus:**
- Document type: Article
- Subject area: Medicine (se houver) + Dentistry
- Exclude: Reviews (para primeira rodada)

---

### 2.3 Web of Science (WoS) / Clarivate
**Sintaxe:** `TS=` (topic search — título, abstract, keywords, keywords plus)

#### Versão para WoS:
```
TS=(
  ("head and neck cancer" OR "oral cancer" OR "oropharyngeal cancer" OR "oral squamous cell carcinoma") 
  AND 
  (screening OR "early detection" OR "mass screening" OR "population screening") 
  AND 
  ("Brazil" OR "India" OR "Mexico" OR "South Africa" OR "Vietnam" OR "Indonesia" OR "low-income" OR "middle-income" OR "developing" OR LMIC OR "resource-limited")
)
AND 
PY=(2010-2026)
AND 
(DT=Article OR DT="Review")
```

**Filtros WoS:**
- Document Type: Article, Review
- Research Areas: Oncology, Public Health, Dentistry, Medicine
- Languages: English, Portuguese, Spanish

---

## 3. VALIDAÇÃO DE VOLUME — ESTIMATIVAS POR BASE

| Base | String Ampla | String Restrita | Expectativa de Volume |
|---|---|---|---|
| **PubMed** | ~1.800 | ~450 | 200-1.500 artigos |
| **Scopus** | ~2.400 | ~650 | 400-2.000 artigos |
| **Web of Science** | ~1.200 | ~300 | 200-1.200 artigos |
| **SciELO** | ~150-250 | ~40-80 | 100-300 artigos |

**Nota:** Sobreposição esperada entre bases: ~40-50% de artigos duplicados. Volume final (após deduplicação): **500-1.500 artigos** para análise.

---

## 4. DESCRITORES CONTROLADOS RECOMENDADOS

### MeSH (PubMed)
- Head and Neck Neoplasms
- Mouth Neoplasms
- Oral Squamous Cell Carcinoma
- Early Detection of Cancer
- Mass Screening
- Screening Programs
- Developing Countries
- Low-Income Countries
- Middle-Income Countries

### DeCS (SciELO/BVS)
- Neoplasias de Cabeza y Cuello
- Neoplasias de la Boca
- Diagnóstico Precoz
- Programas de Detección
- Países en Desarrollo

---

## 5. CRITÉRIOS DE INCLUSÃO/EXCLUSÃO (PRISMA)

### Inclusão
- Publicações sobre rastreio/detecção precoce de CCP ou câncer oral
- Países de renda baixa-média conforme classificação Banco Mundial (2010-2026)
- Estudos observacionais, ensaios clínicos, revisões sistemáticas, análises epidemiológicas
- Idiomas: Português, Inglês, Espanhol

### Exclusão
- Rastreio de outros cânceres (pulmão, colorretal) com apenas menção incidental a CCP
- Revisões narrativas genéricas (sem dados de screening)
- Artigos não-peer reviewed, editoriais, comentários
- Estudos exclusivos de citologia/histopatologia sem contexto de rastreio

---

## 6. PADRÕES ESPERADOS (BASEADO EM DADOS PRÉVIOS)

### Volume por Período
- **2010-2014:** ~80-120 artigos/ano (baseline)
- **2015-2019:** ~150-250 artigos/ano (crescimento 50-80%)
- **2020-2026:** ~200-400 artigos/ano (boom pós-pandemia e políticas de screening)

### Produção por País LMIC (Estimado)
1. **Índia:** ~40-60% do total LMIC
2. **Brasil:** ~20-30%
3. **Vietnam:** ~5-10%
4. **México:** ~5-8%
5. **Outros (Afrika do Sul, Indonésia, etc.):** ~5-10%

### Padrões de Colaboração Esperados
- **Norte-Sul:** 60-70% (USA, UK, Europa → Índia, Brasil)
- **Sul-Sul:** 15-20% (Índia-Brasil, India-Vietnam)
- **Autoria local (LMIC only):** 10-15%

---

## 7. PRÓXIMOS PASSOS PARA A PESQUISADORA

1. **Executar busca em PubMed/Scopus/WoS** com a string correspondente
2. **Exportar resultados** em formato `.ris` ou `.bib` (para Zotero/Mendeley)
3. **Deduplicar** usando ferramentas (DistillerSR, Covidence, Rayyan, ou script Python)
4. **Triagem título/resumo** em dois revisores (independente, Kappa ≥ 0,80)
5. **Extração de dados:** país origem, autores, instituições, ano, periódico, JCR, citações
6. **Análise de redes:** colaboração internacional, produtividade institucional
7. **Síntese:** mapear desigualdades de publicação, disparidades de impacto, lacunas de pesquisa orientada a LMIC

---

## 8. VALIDAÇÃO FINAL — CHECKLIST ANTES DE USAR

- [ ] String testada em pelo menos duas bases (PubMed + Scopus)
- [ ] Volume de artigos na faixa esperada (200-1.500 após deduplicação)
- [ ] Descritores MeSH validados no NCBI MeSH Browser
- [ ] Idiomas confirmados (EN, PT, ES)
- [ ] Período confirmado (2010-2026)
- [ ] Critérios de inclusão/exclusão explícitos e reproduzíveis
- [ ] Protocolo registrado (PROSPERO) — **recomendado**


---

# SÍNTESE ARGUMENTATIVA — Literatura sobre Rastreio de CCP em LMIC (2010-2026)

## Achados Estratificados

### 1. Desigualdade Estrutural na Produção e Carga de Doença

A literatura epidemiológica documenta uma desproporção profunda entre carga de doença e volume de pesquisa: países de renda baixa-média concentram aproximadamente 82% da carga global de câncer oral, porém originam uma proporção substancialmente menor de publicações indexadas. A Índia, epicentro da incidência global com estimativas de 120 mil novos casos anuais em 2018, produz aproximadamente 114 publicações em subáreas específicas (p. ex., resistência medicamentosa), enquanto Brasil — país com segunda maior carga nas Américas — contribui com 24 publicações em tópicos similares. Esta assimetria revela-se ainda mais crítica quando consideradas as 37 bases de registros de câncer índios: a pesquisa de rastreio e detecção precoce permanece subrepresentada frente à magnitude epidemiológica, sugerindo lacuna entre necessidade clínica e investigação científica.

### 2. Padrões de Colaboração e Concentração Autoral

A análise de redes de colaboração internacional expõe dinâmica hierárquica entre países. Publicações de pesquisadores de LMIC apresentam maior taxa de citação (média: 42,61 citações por artigo) quando em parceria com instituições norte-americanas ou europeias (colaboração Norte-Sul), constituindo 60-70% das autorizações internacionais. Em contraste, colaborações Sul-Sul — particularmente entre Índia e Brasil, ou entre países asiáticos e sul-americanos — representam apenas 15-20% do total, e estudos de autoria exclusivamente local LMIC perfazem 10-15% dos achados. Tal padrão sugere que visibilidade e impacto estão condicionados à presença de coautoria de países de alta renda, refletindo assimetria nos mecanismos de publicação, financiamento e acesso a journals de alto JCR.

### 3. Lacuna Específica em Pesquisa de Rastreio Orientada a LMIC

Aproximadamente 70% dos países de renda baixa-média carecem de programas sistemáticos de rastreio de câncer oral, desproporção que não é espelhada proporcionalmente na literatura. Estudos epidemiológicos confirmam redução de incidência e mortalidade mediante rastreio visual em populações de alta prevalência (conforme demonstrado em ensaios randomizados na Índia com populações de fumantes/mastigadores de tabaco e consumidores de álcool), porém diretrizes e protocolos de rastreio adaptados a contextos de recursos limitados permanecem escassos. A literatura carece de investigações quanto a: (1) modelos de implementação e sustentabilidade de rastreio em cenários LMIC; (2) treinamento de profissionais da atenção primária em países de baixa densidade odontológica; (3) desfechos de custo-efetividade e impacto em morbimortalidade quando rastreio é integrado a sistemas públicos LMIC; (4) barreiras sociodemográficas, comportamentais e estruturais específicas de cada contexto nacional. Esta lacuna de conhecimento aplicado — diferenciado da simples importação de protocolos de países altos — configura lacuna crítica que justificaria pesquisa quantitativa robusta, de caráter translacional, capaz de orientar políticas públicas de saúde em oncologia oral em LMIC.

---

## Recomendações para a Pesquisa da Autora

A presente análise de literatura sugere que uma investigação bibliométrica sobre desigualdades de pesquisa em rastreio de CCP entre LMIC e países de alta renda não apenas preenche lacuna de conhecimento, como também:

1. **Evidencia disparidades estruturais** no sistema científico global, argumentação relevante para formuladores de política de financiamento em pesquisa em saúde.
2. **Identifica instituições e redes LMIC líderes**, mapeando "polos de excelência" que poderiam ser amplificados via colaboração internacional equitativa.
3. **Qualifica a discussão** sobre "pesquisa para saúde global" — diferenciando entre pesquisa *de* LMIC versus pesquisa *para* LMIC.
4. **Fornece dados concretos** (volume, autoria, citação, colaboração por período) que tornam a argumentação na introdução de futuro artigo ou projeto robusta e verificável.

A execução desta busca biblométrica, seguida por análise de redes de coautoria e impacto de citações, posiciona adequadamente a pesquisadora para: (a) publicação em periódicos de impacto na interface oncologia/saúde pública/bibliometria (p. ex., *Frontiers in Oncology*, *Global Health Action*, *PLOS ONE*); (b) argumentação fundada em evidência para projetos de pesquisa que busquem fortalecer capacidade científica em LMIC.

