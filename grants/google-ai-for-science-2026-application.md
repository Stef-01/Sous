# Sous — Google.org Impact Challenge: AI for Science 2026

**Applicant:** Stefan Thottunkal, MD Candidate; in affiliation with NOURISH, Stanford Occupational Health / Primary Care & Population Health (PCPH), Department of Medicine, Stanford University
**Category:** AI for Health & Life Sciences
**Amount Requested:** $500,000 + Google Cloud credits + Accelerator participation
**Deadline:** April 17, 2026
**Project Codename:** Sous — Topological Cultural Nutrition Intelligence

---

## PROJECT NARRATIVE (2 pages)

### The Problem

One-third of U.S. adults have obesity. Type 2 diabetes (T2D) is rising fastest among Asian, Indian, Filipino, Latino, and other minority populations — groups who manifest metabolic disease at **normal BMI**, an "invisible" phenotype that standard screening misses. The dominant clinical response — dietary counseling that abandons culturally central foods (rice, roti, dal, tortillas) for white-American-validated alternatives (quinoa, kale, oats) — fails twice: short-term non-adherence (patients revert within weeks) and long-term identity loss (rejecting one's cultural food identity degrades both compliance and psychological wellbeing). The underlying scientific gap is that **the molecular flavor network of traditional cuisines has never been characterized at the scale needed to generate culturally-authentic yet glycemically-optimized meal plans.** FlavorDB catalogs 25,000+ flavor molecules in ~950 ingredients; ICMR-NIN and USDA map nutritional composition; continuous glucose monitoring (CGM) reveals individual glycemic response — but no system integrates these through topological data analysis (TDA) to produce **personalized, culturally-conserved, glucose-predictive meal recommendations.**

### The Science

Sous builds a **topological flavor-nutrient-glycemic atlas** that unifies three data modalities most nutrition-AI systems treat in isolation:

1. **Flavor-molecule networks** (FlavorDB, FooDB, volatile compound databases) — the chemical grammar of why specific ingredient pairings taste "correct" within a cuisine.
2. **Nutritional composition** (USDA SR, ICMR-NIN Indian Food Composition Tables, Filipino FNRI databases) — macro/micronutrient profiles at the ingredient level.
3. **Personalized glycemic response** (continuous glucose monitoring data from NOURISH's ongoing CGM Pilot in 30 Indian + Filipino T2D adults) — individual, real-world glucose curves by food, preparation method, and timing.

Using **Topological Data Analysis (Mapper algorithm, persistent homology)**, we construct high-dimensional manifolds where traditional dishes occupy "flavor-nutrient neighborhoods." Within each neighborhood, TDA identifies **isoflavorous substitutions** — modifications that preserve the manifold position (taste/texture/cultural identity) while shifting the nutritional/glycemic coordinate (health outcome). This is fundamentally different from rule-based "replace white rice with quinoa" logic. It is the first system to **mathematically formalize the NOURISH clinical insight that modification > abstinence.**

The outputs are (a) a **foundational open dataset** — the first public topological flavor-nutrient-glycemic atlas for South Asian and East/Southeast Asian cuisines, released under CC-BY-SA; (b) **open-weights models** trained on the atlas, released on Hugging Face for the research community; (c) a **clinically validated meal-recommendation platform** deployable via the NOURISH Clinical Integration Portal (in active design, 8-week MVP path) to any Asian American or South Asian diabetic patient at point of diagnosis.

### Why Now

Three enabling conditions converged in the last 18 months: (1) FlavorDB and adjacent molecular databases reached critical mass (~25K molecules, ~950 ingredients); (2) CGM costs dropped below $100/week, enabling real-world glucose capture at research scale; (3) TDA libraries (giotto-tda, Kepler-Mapper, GUDHI) matured on GPU-accelerated infrastructure available through Google Cloud's Vertex AI. NOURISH's own recruiting CGM Pilot (funded by Stanford Diabetes Research Center and Stanford Center for Asian Research and Education post-NIH funding cuts) provides the primary labeled glucose-response data. **No other group combines these three modalities with TDA.** The closest competitors (Twin Health, Virta Health, Nutrisense) use black-box recommendation engines without cultural food science foundations, open data releases, or TDA methodology.

### Track Record

NOURISH is a Stanford-housed research organization founded February 2021 by Dr. Minal Moharir and Dr. Latha Palaniappan. Over four years it has: secured **$160K+ in institutional funding** (Stanford CARE $100K; PCPH Pilot $5K; PBDI Pilot $5K; Stanford Diabetes Research Center $50K; Stanford CARE renewal); completed a **Patient Guide pilot (25 participants)** with publication forthcoming; launched the **CGM Pilot recruiting now** (30 participants, Indian + Filipino T2D); launched the **PLANT Study teaching kitchen** (September 2025); partnered with Stanford Residential & Dining Enterprises (6 NOURISH recipes in dining halls), Genentech, MedChefs, and San Jose State University (Dr. Ashwini Wagle); and distributed content through the Stanford Occupational Health Center (~1,000 direct patient visits/year, ~7,000 touched/year) and a **South Asian Heart Center talk that reached 408,300 views.** Applicant is Stanford-affiliated through NOURISH, is currently leading the Sous software platform, and has access to the NOURISH Clinical Integration Portal (Stanford-hosted domain, design complete, 8-week MVP path) as the clinical delivery channel.

### Success Metrics (evidence-based, quantifiable)

| Milestone             | Metric                                                          | Target (18 months)                                           |
| --------------------- | --------------------------------------------------------------- | ------------------------------------------------------------ |
| Open dataset release  | Ingredients × molecules × nutrients × glycemic-response records | ≥1,500 ingredients, ≥40K molecule-nutrient-response triplets |
| Model release         | Isoflavorous-substitution model on Hugging Face                 | v1.0 with documented benchmarks                              |
| Clinical validation   | Δ HbA1c vs usual care (NOURISH Clinical Portal arm)             | ≥0.5 percentage-point reduction at 90 days (n=60)            |
| Adherence             | % participants with ≥70% meal-plan compliance                   | ≥60% at 12 weeks (vs published ~30% for standard counseling) |
| Publications          | Peer-reviewed manuscripts                                       | ≥3 (Diabetes Care, J Nutr, Nature Food or equivalent)        |
| Reach                 | Patients served via clinical portal                             | ≥2,000 in year 1; ≥20,000 in year 3                          |
| Open-science adoption | Downstream citations + dataset downloads                        | ≥500 downloads, ≥10 downstream research uses                 |

### Responsible AI

All data collection is IRB-approved through Stanford. Patient data is de-identified before modeling; no patient-level data leaves the NOURISH clinical environment. Models are released as open weights under Apache 2.0. The platform surfaces **reasoning** (why a substitution is recommended — which nutrients shift, which molecules are preserved) rather than black-box outputs — consistent with Google's Responsible AI Principles of transparency, fairness (cultural inclusivity is the core design constraint), and privacy.

### Scalability

The topological atlas generalizes: once Indian + Filipino cuisines are characterized, adding Vietnamese, Chinese, Japanese, Korean, Mexican, or West African requires only ingredient-level data extension, not architectural change. The open dataset + open models create a **compounding public good** usable by any clinical team, any app developer, any nutrition researcher, globally. The NOURISH clinical portal is replicable across occupational health centers (Stanford's is the template; Kaiser, Sutter, UCSF, Mass General are plausible next-site partners already modeled in NOURISH V1 clinical integration design).

### 18-Month Execution Plan

**Months 0–3:** Infrastructure on Google Cloud — Vertex AI pipelines, BigQuery data warehouse, Cloud Storage for raw FlavorDB/ICMR/USDA imports, Dataflow for ETL. TDA prototyping on Compute Engine GPU instances. IRB amendment for Sous arm of CGM Pilot.

**Months 3–9:** Atlas construction. Ingest flavor-molecule, nutritional, and NOURISH CGM-response datasets into BigQuery. Run TDA pipelines to identify isoflavorous-substitution neighborhoods. Train substitution model on Vertex AI. Pilot meal recommendations with 10 NOURISH patients (internal validation).

**Months 9–15:** Clinical integration. Deploy Sous meal-recommendation API through NOURISH Clinical Portal. Expand CGM cohort to 60 patients (Indian, Filipino, Chinese, Vietnamese, Japanese arms). Measure A1C, TIR, adherence vs usual care.

**Months 15–18:** Open release. Publish dataset (Zenodo + Hugging Face Datasets), models (Hugging Face), and first paper. Present at American Diabetes Association Scientific Sessions and AI in Medicine venues.

---

## BUDGET — $500,000 over 18 months

| Category                                           | Subtotal     | Notes                                                                                     |
| -------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------- |
| **Personnel (67%)**                                | **$335,000** |                                                                                           |
| Applicant (0.75 FTE × 18 mo) — technical lead      | $108,000     | Software architecture, TDA implementation, clinical integration                           |
| Research Software Engineer (1.0 FTE × 12 mo)       | $130,000     | Vertex AI pipeline, BigQuery ETL, model training                                          |
| Clinical Research Coordinator (0.5 FTE × 18 mo)    | $54,000      | CGM cohort expansion, IRB mgmt, patient enrollment                                        |
| Registered Dietitian consultant (0.2 FTE × 18 mo)  | $28,000      | Cultural food validation, recipe curation (Shailaja Mathur, Lily Phan, or Dalia Perelman) |
| Data labeling / ingredient verification (contract) | $15,000      | ICMR-NIN and regional cuisine specialists                                                 |
| **Cloud & Infrastructure (12%)**                   | **$60,000**  | Assumes Google Cloud credits cover an additional ~$30K                                    |
| Vertex AI (training, prediction endpoints)         | $28,000      | ~600 GPU-hours at market rates                                                            |
| BigQuery storage + queries                         | $12,000      | Atlas data warehouse; partitioned tables                                                  |
| Cloud Storage / Dataflow ETL                       | $8,000       | FlavorDB, USDA SR, ICMR ingestion pipelines                                               |
| Cloud Run / App Engine (API hosting)               | $7,000       | Clinical portal backend                                                                   |
| Secret Manager, IAM, monitoring                    | $5,000       | Security + ops                                                                            |
| **CGM Supplies & Clinical (10%)**                  | **$50,000**  | 60 participants × 2 wk × Dexcom G7 sensors                                                |
| **Publications & Dissemination (4%)**              | **$20,000**  | Open-access fees, conference travel (ADA Scientific Sessions, AIME), Zenodo/HF hosting    |
| **Patient Incentives (3%)**                        | **$15,000**  | $250 per participant × 60 CGM cohort                                                      |
| **IRB & Compliance (1%)**                          | **$5,000**   | Amendment fees, data privacy audit                                                        |
| **Indirect Costs (3%)**                            | **$15,000**  | Stanford F&A at sponsor-capped rate for this grant type                                   |
| **TOTAL**                                          | **$500,000** |                                                                                           |

---

## GOOGLE CLOUD SERVICES

| Service                              | Primary Use                                                                                                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Vertex AI**                        | TDA model training, endpoint deployment for meal-recommendation API, Vertex AI Experiments for reproducibility |
| **Vertex AI Model Garden**           | Starting points from open-source foundation models (including MedGemma for clinical summary generation)        |
| **BigQuery**                         | Flavor-nutrient-glycemic atlas data warehouse; partitioned tables by cuisine × ingredient × molecule           |
| **BigQuery ML**                      | Rapid baseline models for glycemic response prediction before TDA layers                                       |
| **Cloud Storage**                    | Raw dataset landing zone (FlavorDB, USDA SR, ICMR-NIN, CGM exports) with lifecycle policies                    |
| **Cloud Dataflow**                   | ETL pipelines from heterogeneous dataset schemas into BigQuery canonical form                                  |
| **Compute Engine (A100/H100 GPU)**   | TDA Mapper + persistent homology on high-dimensional flavor manifolds (giotto-tda, GUDHI)                      |
| **Cloud Run**                        | Sous meal-recommendation API for NOURISH Clinical Portal integration                                           |
| **Cloud Healthcare API**             | De-identification of CGM data before model ingestion                                                           |
| **Identity Platform + IAM**          | Stanford SSO integration for clinical portal, role-based data access                                           |
| **Secret Manager**                   | API keys, PHI-adjacent credentials                                                                             |
| **Cloud Monitoring + Logging**       | Pipeline observability, model drift detection                                                                  |
| **Cloud DLP (Data Loss Prevention)** | Automated PII scanning on ingestion                                                                            |
| **Looker Studio**                    | Clinical dashboards for NOURISH team + grant-reporting metrics                                                 |
| **Pub/Sub**                          | Real-time CGM event streaming into BigQuery                                                                    |

---

## THREE KEY DIFFERENTIATORS vs. EXISTING NUTRITION AI

### 1. Topological Data Analysis on Flavor-Molecule Networks — not embedding-space clustering

**Twin Health, Virta, Nutrisense, Foodsmart** all use neural-network embedding or rule-based recommendation. None construct topological manifolds of flavor chemistry. **TDA uniquely preserves the geometric structure of "what makes a dish culturally coherent"** — a Biryani variant within the same homological class tastes like Biryani; a variant outside the class tastes foreign. This is the mathematical formalization of the cultural-food-modification principle that all ethnographic research on dietary intervention adherence validates (a patient who is told to replace rice with quinoa abandons the program; a patient who is told to cook the same Biryani with brown basmati and more vegetables continues). No other nutrition-AI system operationalizes this rigorously.

### 2. Open Foundational Dataset — not proprietary walled garden

**Twin Health's model and data are closed. Virta's metabolic data is closed. Nutrisense's glucose-food database is closed.** Sous releases the entire flavor-nutrient-glycemic atlas under CC-BY-SA and open-weights models on Hugging Face. This converts a private commercial asset into a **public scientific good** — matching Google.org's preference for open-source releases and foundational datasets that enable "future AI use cases." Downstream: any clinical team, any researcher, any app developer can build on the atlas; NOURISH + Sous remain the reference implementation but the scientific knowledge is non-rivalrous.

### 3. Clinical-Integration Substrate, Not Direct-to-Consumer

**Twin Health, Nutrisense, Hello Heart** require consumer acquisition and retention; they compete for attention in the App Store and spend heavily on CAC. **Sous deploys through the NOURISH Clinical Integration Portal** — the point-of-care handoff from physician to patient at the moment of T2D diagnosis. This is an **opt-out distribution pattern** (the doctor hands you the portal as part of standard care) versus the opt-in pattern (download an app, remember to use it) that drives 80%+ attrition in competing tools. The clinical-integration substrate also gives Sous direct access to clinically-meaningful outcome data (A1C, weight, BP, lipids) that direct-to-consumer apps never see. Combined, this means: lower acquisition cost, higher adherence, clinical-grade measurement, and a replication pathway across any occupational health or primary care network.

---

## RESPONSIBLE AI & RISK STATEMENT

**Data privacy:** All patient data de-identified at ingestion via Cloud Healthcare API + DLP scanning. No PHI leaves the Stanford clinical environment. Stanford IRB-approved protocol, renewal-eligible.

**Bias mitigation:** Initial Indian + Filipino cuisine focus is intentional (the populations most underserved by existing nutrition AI); Year 2 adds Chinese, Vietnamese, Japanese, Korean, and Latin American cohorts. Model reports confidence intervals and refuses recommendations outside training distribution.

**Clinical safety:** Sous is positioned as a decision-support tool for clinicians and patients, not an autonomous prescriber. Every recommendation shows the underlying substitution rationale. Contraindication flags for drug-food interactions, renal dysfunction, and pregnancy.

**Open-science commitment:** Dataset and models released within 3 months of paper acceptance. No patent filings that would restrict downstream use.

---

## TEAM

- **Stefan Thottunkal** — Applicant; technical lead; Macquarie MD Class of 2026; Stanford QUAD Fellow; PCORI-funded researcher
- **Dr. Minal Moharir** — NOURISH Co-founder, Stanford Occupational Health clinician, Principal Investigator
- **Dr. Latha Palaniappan** — NOURISH Co-founder, Stanford faculty (MD, MS), health equity expert
- **Dr. Christopher Gardner** — Stanford Prevention Research Center, plant-based nutrition researcher, PLANT Study PI
- **Dr. Rich Wittman (MD, MPH)** — Medical Director, Stanford + SLAC Occupational Health Centers
- **Lily Phan, Shailaja Mathur, Dalia Perelman** — NOURISH Registered Dietitians
- **Dr. Ashwini Wagle** — SJSU South Asian nutrition expert, external validator

---

## REFERENCES (for grant reviewers)

- NOURISH Genesis Document (canonical organizational record, Feb 2021 – May 2025)
- FlavorDB2: Flavor Molecule Database, Garg et al. 2022
- ICMR-NIN Indian Food Composition Tables, 2017
- DIETFITS Trial, Gardner et al. 2018 (Stanford Prevention Research Center)
- Virta Health T2D outcomes (Hallberg et al. 2018) — comparator
- Twin Health Whole Body Digital Twin — comparator
- Topological Data Analysis in biomedical applications (Nicolau, Carlsson), 2011+

---

_Draft prepared 2026-04-13 by Sous + NOURISH team. Ready for final review, PI signature, and submission by 2026-04-17._
