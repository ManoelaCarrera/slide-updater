# STRING DE BUSCA — VERSÃO PORTUGUÊS (PT-BR)

## 1. ADAPTAÇÃO PARA BASES EM PORTUGUÊS

### 1.1 BVS/LILACS (SciELO)
**Sintaxe:** `ab:` (abstract), `ti:` (title), `au:` (author), `year_cluster`

#### String otimizada para BVS:
```
(ti:("câncer de cabeça e pescoço" OR "câncer oral" OR "carcinoma de células escamosas oral") 
OR 
ab:("câncer de cabeça e pescoço" OR "câncer oral" OR "carcinoma de células escamosas oral")) 
AND 
(ti:(rastreio OR rastreamento OR "detecção precoce" OR "triagem" OR "diagnóstico precoce") 
OR 
ab:(rastreio OR rastreamento OR "detecção precoce" OR "triagem" OR "diagnóstico precoce"))
AND 
(Brasil OR Índia OR México OR "África do Sul" OR Vietnã OR Indonésia OR "país de renda baixa" OR "país de renda média" OR "país em desenvolvimento" OR LMIC)
AND 
year_cluster:[2010 TO 2026]
```

**Filtros em BVS:**
- Tipo de estudo: Artigo de pesquisa, Revisão sistemática, Ensaio clínico
- Idioma: português, inglês, espanhol
- Bases: SciELO, LILACS

---

### 1.2 String Ampla em Português
```
("câncer de cabeça e pescoço" OR "câncer oral" OR "neoplasia oral" OR "carcinoma oral") 
E 
(rastreio OR rastreamento OR "detecção precoce" OR "diagnóstico precoce" OR "triagem") 
E 
(Brasil OR Índia OR México OR "África do Sul" OR Vietnã OR Indonésia OR "país de renda baixa" OR "país de renda média" OR "país em desenvolvimento" OR LMIC)
```

### 1.3 String Restrita em Português
```
("câncer oral" OR "neoplasia oral") 
E 
(rastreio OR "detecção precoce") 
E 
(LMIC OR "país de renda média" OR "país de renda baixa" OR "país em desenvolvimento")
```

---

## 2. TERMOS TRADUZIDOS E EQUIVALÊNCIAS

| Termo Inglês | Termo Português | Descritores MeSH Correspondentes |
|---|---|---|
| Head and neck cancer | Câncer de cabeça e pescoço | Neoplasias de Cabeça e Pescoço |
| Oral cancer | Câncer oral | Neoplasias da Boca |
| Oral squamous cell carcinoma | Carcinoma de células escamosas oral | Carcinoma de Células Escamosas |
| Screening | Rastreio/Rastreamento | Detecção Precoce de Câncer, Programas de Rastreio |
| Early detection | Detecção precoce | Diagnóstico Precoce |
| Mass screening | Rastreamento em massa | Rastreamento em Massa |
| Population screening | Rastreamento populacional | Programas de Rastreio |
| Low-income country | País de renda baixa | Países em Desenvolvimento |
| Middle-income country | País de renda média | Países em Desenvolvimento |
| Developing country | País em desenvolvimento | Países em Desenvolvimento |
| LMIC | PBMAR (País de Baixa e Média Renda) | Países em Desenvolvimento |

**Nota:** DeCS em BVS usa "Países en Desarrollo" como descritor principal. Para busca em português, usar também "Saúde Pública em Países em Desenvolvimento".

---

## 3. ESTRATÉGIA COMPLEMENTAR: BUSCA POR PAÍS ISOLADO (Triagem)

Para validação de volume, recomenda-se executar buscas isoladas por país e depois compor:

### 3.1 Busca Brasil
```
("câncer de cabeça e pescoço" OR "câncer oral") AND (rastreio OR "detecção precoce") AND Brasil
```

### 3.2 Busca Índia
```
("head and neck cancer" OR "oral cancer") AND (screening OR "early detection") AND India
```

### 3.3 Busca México
```
("cáncer de cabeza y cuello" OR "cáncer oral") AND (cribado OR "detección precoz") AND México
```

---

## 4. VOLUME ESTIMADO — ADAPTADO PARA PORTUGUÊS

| Base | String Ampla PT | String Restrita PT | Expectativa |
|---|---|---|---|
| **SciELO** | 80-120 | 20-40 | 50-150 artigos |
| **LILACS** | 100-180 | 30-60 | 80-200 artigos |
| **DeCS controlled** | 60-100 | 15-30 | 40-100 artigos |

**Nota:** Bases em português capturam menor volume que PubMed/Scopus. Recomenda-se:
1. Priorizar PubMed + Scopus + WoS (cobertura global, incluindo artigos de pesquisadores LMIC publicados em inglês)
2. Usar BVS/SciELO como complemento para pesquisa originária de Brasil, Iberoamérica

---

## 5. RECOMENDAÇÃO FINAL

Dado que a pesquisa será de caráter bibliométrico sobre *publicações científicas globais*, a estratégia ideal é:

1. **Primeira linha:** Executar strings inglês em PubMed, Scopus, WoS (captura ~1.500-2.000 artigos)
2. **Complemento:** BVS/SciELO com strings português/espanhol (captura ~150-300 artigos adicionais)
3. **Deduplicação:** Remover sobreposição (~40-50% estimado entre bases)
4. **Volume final esperado:** 500-1.500 artigos únicos para análise bibliométrica

