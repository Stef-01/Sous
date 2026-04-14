const fs = require("fs");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  PageOrientation,
  LevelFormat,
  ExternalHyperlink,
  TabStopType,
  TabStopPosition,
  PageNumber,
  PageBreak,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  VerticalAlign,
} = require("docx");

// ============ STYLE CONSTANTS ============
const ACCENT = "1A5490"; // Stanford-ish blue
const ACCENT_LIGHT = "D5E8F0"; // Light blue for table headers
const ACCENT_SOFT = "F0F5F9"; // Very light blue for alt rows
const TEXT_COLOR = "1A1A1A";
const MUTED = "555555";
const BORDER_COLOR = "BFBFBF";

const border = { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR };
const borders = { top: border, bottom: border, left: border, right: border };

// US Letter page: 12240 x 15840 DXA (1" margins = 1440 DXA)
// Content width with 1" margins: 12240 - 1440*2 = 9360
const CONTENT_WIDTH = 9360;

// ============ HELPERS ============

const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: opts.after ?? 120, before: opts.before ?? 0, line: 280 },
    alignment: opts.align ?? AlignmentType.LEFT,
    ...(opts.heading && { heading: opts.heading }),
    children: Array.isArray(text)
      ? text
      : [
          new TextRun({
            text,
            bold: opts.bold ?? false,
            italics: opts.italics ?? false,
            color: opts.color ?? TEXT_COLOR,
            size: opts.size ?? 22, // 11pt default
            font: "Arial",
          }),
        ],
  });

const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [
      new TextRun({ text, bold: true, color: ACCENT, size: 32, font: "Arial" }),
    ],
  });

const h2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: TEXT_COLOR,
        size: 26,
        font: "Arial",
      }),
    ],
  });

const h3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: TEXT_COLOR,
        size: 22,
        font: "Arial",
      }),
    ],
  });

const bullet = (text, level = 0) =>
  new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 80, line: 280 },
    children: Array.isArray(text)
      ? text
      : [new TextRun({ text, size: 22, font: "Arial" })],
  });

const run = (text, opts = {}) =>
  new TextRun({
    text,
    bold: opts.bold ?? false,
    italics: opts.italics ?? false,
    color: opts.color ?? TEXT_COLOR,
    size: opts.size ?? 22,
    font: "Arial",
  });

const tableCell = (content, opts = {}) => {
  const children = Array.isArray(content)
    ? content.map((c) => (typeof c === "string" ? p(c, { after: 40 }) : c))
    : [typeof content === "string" ? p(content, { after: 40 }) : content];

  return new TableCell({
    borders,
    width: { size: opts.width, type: WidthType.DXA },
    shading: opts.shading
      ? { fill: opts.shading, type: ShadingType.CLEAR }
      : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    verticalAlign: VerticalAlign.TOP,
    children,
  });
};

const headerCell = (text, width) =>
  tableCell(p(text, { bold: true, color: "FFFFFF", after: 40 }), {
    width,
    shading: ACCENT,
  });

// ============ DOCUMENT CONTENT ============

const doc = new Document({
  creator: "Stefan Thottunkal (NOURISH / Stanford)",
  title: "Sous — Google.org AI for Science 2026 Application",
  description:
    "Grant application for Google.org Impact Challenge: AI for Science 2026",

  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } },
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, color: ACCENT, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, color: TEXT_COLOR, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 22, bold: true, color: TEXT_COLOR, font: "Arial" },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 },
      },
    ],
  },

  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 560, hanging: 280 } } },
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "◦",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1000, hanging: 280 } } },
          },
        ],
      },
    ],
  },

  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "Sous — Google.org AI for Science 2026",
                  size: 18,
                  color: MUTED,
                  font: "Arial",
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Stefan Thottunkal · NOURISH · Stanford · ",
                  size: 18,
                  color: MUTED,
                  font: "Arial",
                }),
                new TextRun({
                  text: "Page ",
                  size: 18,
                  color: MUTED,
                  font: "Arial",
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                  color: MUTED,
                  font: "Arial",
                }),
                new TextRun({
                  text: " of ",
                  size: 18,
                  color: MUTED,
                  font: "Arial",
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: 18,
                  color: MUTED,
                  font: "Arial",
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ======== TITLE BLOCK ========
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: "Sous",
              bold: true,
              color: ACCENT,
              size: 56,
              font: "Arial",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: "Topological Cultural Nutrition Intelligence for Minority Diabetic Care",
              italics: true,
              color: MUTED,
              size: 24,
              font: "Arial",
            }),
          ],
        }),

        // Title info table
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3000, 6360],
          rows: [
            ["Applicant", "Stefan Thottunkal, MD Candidate"],
            [
              "Institutional Affiliation",
              "NOURISH — Stanford Occupational Health / PCPH, Department of Medicine, Stanford University",
            ],
            [
              "Grant Program",
              "Google.org Impact Challenge: AI for Science 2026",
            ],
            ["Category", "AI for Health & Life Sciences"],
            [
              "Amount Requested",
              "$500,000 + Google Cloud credits + Accelerator participation",
            ],
            ["Deadline", "April 17, 2026"],
            ["Submission Date", "______________________"],
          ].map(
            ([label, value], idx) =>
              new TableRow({
                children: [
                  tableCell(p(label, { bold: true, after: 40 }), {
                    width: 3000,
                    shading: idx % 2 === 0 ? ACCENT_SOFT : undefined,
                  }),
                  tableCell(value, {
                    width: 6360,
                    shading: idx % 2 === 0 ? ACCENT_SOFT : undefined,
                  }),
                ],
              }),
          ),
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ======== 1. PROJECT NARRATIVE ========
        h1("1. Project Narrative"),

        h2("The Problem"),
        p([
          run(
            "One-third of U.S. adults have obesity. Type 2 diabetes (T2D) is rising fastest among ",
          ),
          run(
            "Asian, Indian, Filipino, Latino, and other minority populations",
            { bold: true },
          ),
          run(" — groups who manifest metabolic disease at "),
          run("normal BMI", { italics: true }),
          run(
            ", an \u201Cinvisible\u201D phenotype that standard screening misses. The dominant clinical response — dietary counseling that abandons culturally central foods (rice, roti, dal, tortillas) for white-American-validated alternatives (quinoa, kale, oats) — fails twice: ",
          ),
          run("short-term non-adherence", { bold: true }),
          run(" (patients revert within weeks) and "),
          run("long-term identity loss", { bold: true }),
          run(
            " (rejecting one\u2019s cultural food identity degrades both compliance and psychological wellbeing). The underlying scientific gap is that the molecular flavor network of traditional cuisines has never been characterized at the scale needed to generate culturally-authentic yet glycemically-optimized meal plans. FlavorDB catalogs 25,000+ flavor molecules in ~950 ingredients; ICMR-NIN and USDA map nutritional composition; continuous glucose monitoring (CGM) reveals individual glycemic response — but ",
          ),
          run(
            "no system integrates these through topological data analysis (TDA) to produce personalized, culturally-conserved, glucose-predictive meal recommendations.",
            { bold: true },
          ),
        ]),

        h2("The Science"),
        p(
          "Sous builds a topological flavor-nutrient-glycemic atlas that unifies three data modalities most nutrition-AI systems treat in isolation:",
        ),
        bullet([
          run("Flavor-molecule networks", { bold: true }),
          run(
            " (FlavorDB, FooDB, volatile compound databases) — the chemical grammar of why specific ingredient pairings taste \u201Ccorrect\u201D within a cuisine.",
          ),
        ]),
        bullet([
          run("Nutritional composition", { bold: true }),
          run(
            " (USDA SR, ICMR-NIN Indian Food Composition Tables, Filipino FNRI databases) — macro/micronutrient profiles at ingredient granularity.",
          ),
        ]),
        bullet([
          run("Personalized glycemic response", { bold: true }),
          run(
            " (continuous glucose monitoring data from NOURISH\u2019s ongoing CGM Pilot in 30 Indian + Filipino T2D adults) — individual, real-world glucose curves by food, preparation method, and timing.",
          ),
        ]),
        p([
          run("Using "),
          run(
            "Topological Data Analysis (Mapper algorithm, persistent homology)",
            { bold: true },
          ),
          run(
            ", we construct high-dimensional manifolds where traditional dishes occupy \u201Cflavor-nutrient neighborhoods.\u201D Within each neighborhood, TDA identifies ",
          ),
          run("isoflavorous substitutions", { italics: true, bold: true }),
          run(
            " — modifications that preserve the manifold position (taste/texture/cultural identity) while shifting the nutritional/glycemic coordinate (health outcome). This is fundamentally different from rule-based \u201Creplace white rice with quinoa\u201D logic. It is the first system to ",
          ),
          run(
            "mathematically formalize the NOURISH clinical insight that modification beats abstinence.",
            { bold: true },
          ),
        ]),
        p([
          run("Outputs: (a) a "),
          run("foundational open dataset", { bold: true }),
          run(
            " — the first public topological flavor-nutrient-glycemic atlas for South Asian and East/Southeast Asian cuisines, released under CC-BY-SA; (b) ",
          ),
          run("open-weights models", { bold: true }),
          run(
            " trained on the atlas, released on Hugging Face for the research community; (c) a ",
          ),
          run("clinically validated meal-recommendation platform", {
            bold: true,
          }),
          run(
            " deployable via the NOURISH Clinical Integration Portal (active design, 8-week MVP path) to any Asian American or South Asian diabetic patient at point of diagnosis.",
          ),
        ]),

        h2("Why Now"),
        p([
          run(
            "Three enabling conditions converged in the last 18 months: (1) FlavorDB and adjacent molecular databases reached critical mass (~25K molecules, ~950 ingredients); (2) CGM costs dropped below $100/week, enabling real-world glucose capture at research scale; (3) TDA libraries (",
          ),
          run("giotto-tda, Kepler-Mapper, GUDHI", { italics: true }),
          run(
            ") matured on GPU-accelerated infrastructure available through Google Cloud Vertex AI. NOURISH\u2019s own recruiting CGM Pilot (funded by Stanford Diabetes Research Center and Stanford CARE post-NIH funding cuts) provides the primary labeled glucose-response data. ",
          ),
          run("No other group combines these three modalities with TDA.", {
            bold: true,
          }),
          run(
            " The closest competitors (Twin Health, Virta Health, Nutrisense) use black-box recommendation engines without cultural food science foundations, open data releases, or TDA methodology.",
          ),
        ]),

        h2("Track Record"),
        p([
          run(
            "NOURISH is a Stanford-housed research organization founded February 2021 by Dr. Minal Moharir and Dr. Latha Palaniappan. Over four years it has: secured ",
          ),
          run("$160K+ in institutional funding", { bold: true }),
          run(
            " (Stanford CARE $100K; PCPH Pilot $5K; PBDI Pilot $5K; Stanford Diabetes Research Center $50K; Stanford CARE renewal); completed a ",
          ),
          run("Patient Guide pilot (25 participants)", { bold: true }),
          run(" with publication forthcoming; launched the "),
          run("CGM Pilot recruiting now", { bold: true }),
          run(" (30 participants, Indian + Filipino T2D); launched the "),
          run("PLANT Study teaching kitchen", { bold: true }),
          run(
            " (September 2025); partnered with Stanford Residential & Dining Enterprises (6 NOURISH recipes in dining halls), Genentech, MedChefs, and San Jose State University; and distributed content through the Stanford Occupational Health Center (~1,000 direct patient visits/year, ~7,000 touched/year) and a ",
          ),
          run("South Asian Heart Center talk that reached 408,300 views.", {
            bold: true,
          }),
        ]),

        h2("Success Metrics (evidence-based, quantifiable)"),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [2800, 3600, 2960],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                headerCell("Milestone", 2800),
                headerCell("Metric", 3600),
                headerCell("Target (18 months)", 2960),
              ],
            }),
            ...[
              [
                "Open dataset release",
                "Ingredients × molecules × nutrients × glycemic-response records",
                "≥1,500 ingredients, ≥40K triplets",
              ],
              [
                "Model release",
                "Isoflavorous-substitution model on Hugging Face",
                "v1.0 with documented benchmarks",
              ],
              [
                "Clinical validation",
                "Δ HbA1c vs usual care (NOURISH Clinical Portal arm)",
                "≥0.5 pp reduction at 90 days (n=60)",
              ],
              [
                "Adherence",
                "% participants with ≥70% meal-plan compliance",
                "≥60% at 12 weeks (vs ~30% standard)",
              ],
              [
                "Publications",
                "Peer-reviewed manuscripts",
                "≥3 (Diabetes Care, J Nutr, Nature Food)",
              ],
              [
                "Reach",
                "Patients served via clinical portal",
                "≥2,000 year 1; ≥20,000 year 3",
              ],
              [
                "Open-science adoption",
                "Downstream citations + dataset downloads",
                "≥500 downloads, ≥10 downstream uses",
              ],
            ].map(
              (row, idx) =>
                new TableRow({
                  children: row.map((cell, cidx) =>
                    tableCell(cell, {
                      width: [2800, 3600, 2960][cidx],
                      shading: idx % 2 === 0 ? ACCENT_SOFT : undefined,
                    }),
                  ),
                }),
            ),
          ],
        }),

        h2("Responsible AI"),
        p([
          run(
            "All data collection is IRB-approved through Stanford. Patient data is de-identified before modeling; no patient-level data leaves the NOURISH clinical environment. Models are released as open weights under Apache 2.0. The platform surfaces ",
          ),
          run("reasoning", { italics: true }),
          run(
            " (why a substitution is recommended — which nutrients shift, which molecules are preserved) rather than black-box outputs — consistent with Google\u2019s Responsible AI Principles of ",
          ),
          run("transparency, fairness", { bold: true }),
          run(" (cultural inclusivity is the core design constraint), and "),
          run("privacy", { bold: true }),
          run("."),
        ]),

        h2("Scalability"),
        p(
          "The topological atlas generalizes: once Indian + Filipino cuisines are characterized, adding Vietnamese, Chinese, Japanese, Korean, Mexican, or West African requires only ingredient-level data extension, not architectural change. The open dataset + open models create a compounding public good usable by any clinical team, any app developer, any nutrition researcher, globally. The NOURISH clinical portal is replicable across occupational health centers — Stanford is the template; Kaiser, Sutter, UCSF, Mass General are plausible next-site partners already modeled in NOURISH V1 clinical integration design.",
        ),

        h2("18-Month Execution Plan"),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [1800, 7560],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                headerCell("Phase", 1800),
                headerCell("Activities", 7560),
              ],
            }),
            ...[
              [
                "Months 0–3",
                "Infrastructure on Google Cloud — Vertex AI pipelines, BigQuery warehouse, Cloud Storage for FlavorDB/ICMR/USDA imports, Dataflow for ETL. TDA prototyping on Compute Engine GPU. IRB amendment for Sous arm of CGM Pilot.",
              ],
              [
                "Months 3–9",
                "Atlas construction. Ingest flavor-molecule, nutritional, and NOURISH CGM-response datasets into BigQuery. Run TDA pipelines to identify isoflavorous-substitution neighborhoods. Train substitution model on Vertex AI. Pilot meal recommendations with 10 NOURISH patients (internal validation).",
              ],
              [
                "Months 9–15",
                "Clinical integration. Deploy Sous meal-recommendation API through NOURISH Clinical Portal. Expand CGM cohort to 60 patients (Indian, Filipino, Chinese, Vietnamese, Japanese arms). Measure A1C, TIR, adherence vs usual care.",
              ],
              [
                "Months 15–18",
                "Open release. Publish dataset (Zenodo + Hugging Face Datasets), models (Hugging Face), and first paper. Present at ADA Scientific Sessions and AI in Medicine venues.",
              ],
            ].map(
              (row, idx) =>
                new TableRow({
                  children: [
                    tableCell(p(row[0], { bold: true, after: 40 }), {
                      width: 1800,
                      shading: idx % 2 === 0 ? ACCENT_SOFT : undefined,
                    }),
                    tableCell(row[1], {
                      width: 7560,
                      shading: idx % 2 === 0 ? ACCENT_SOFT : undefined,
                    }),
                  ],
                }),
            ),
          ],
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ======== 2. BUDGET ========
        h1("2. Budget — $500,000 over 18 months"),

        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [4560, 1400, 800, 2600],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                headerCell("Category", 4560),
                headerCell("Amount", 1400),
                headerCell("%", 800),
                headerCell("Notes", 2600),
              ],
            }),

            // Personnel header
            new TableRow({
              children: [
                tableCell(p("Personnel", { bold: true, after: 40 }), {
                  width: 4560,
                  shading: ACCENT_LIGHT,
                }),
                tableCell(p("$335,000", { bold: true, after: 40 }), {
                  width: 1400,
                  shading: ACCENT_LIGHT,
                }),
                tableCell(p("67%", { bold: true, after: 40 }), {
                  width: 800,
                  shading: ACCENT_LIGHT,
                }),
                tableCell("", { width: 2600, shading: ACCENT_LIGHT }),
              ],
            }),
            ...[
              [
                "  Applicant — technical lead (0.75 FTE × 18 mo)",
                "$108,000",
                "",
                "Software architecture, TDA implementation, clinical integration",
              ],
              [
                "  Research Software Engineer (1.0 FTE × 12 mo)",
                "$130,000",
                "",
                "Vertex AI pipeline, BigQuery ETL, model training",
              ],
              [
                "  Clinical Research Coordinator (0.5 FTE × 18 mo)",
                "$54,000",
                "",
                "CGM cohort expansion, IRB management, patient enrollment",
              ],
              [
                "  Registered Dietitian consultant (0.2 FTE × 18 mo)",
                "$28,000",
                "",
                "Cultural food validation (Mathur / Phan / Perelman)",
              ],
              [
                "  Data labeling / ingredient verification (contract)",
                "$15,000",
                "",
                "ICMR-NIN and regional cuisine specialists",
              ],
            ].map(
              (row, idx) =>
                new TableRow({
                  children: row.map((cell, cidx) =>
                    tableCell(cell, {
                      width: [4560, 1400, 800, 2600][cidx],
                      shading: idx % 2 === 0 ? ACCENT_SOFT : undefined,
                    }),
                  ),
                }),
            ),

            // Cloud & Infrastructure header
            new TableRow({
              children: [
                tableCell(
                  p("Cloud & Infrastructure", { bold: true, after: 40 }),
                  { width: 4560, shading: ACCENT_LIGHT },
                ),
                tableCell(p("$60,000", { bold: true, after: 40 }), {
                  width: 1400,
                  shading: ACCENT_LIGHT,
                }),
                tableCell(p("12%", { bold: true, after: 40 }), {
                  width: 800,
                  shading: ACCENT_LIGHT,
                }),
                tableCell(
                  p("Assumes ~$30K add\u2019l in Cloud credits", {
                    italics: true,
                    after: 40,
                  }),
                  { width: 2600, shading: ACCENT_LIGHT },
                ),
              ],
            }),
            ...[
              [
                "  Vertex AI (training, prediction endpoints)",
                "$28,000",
                "",
                "~600 GPU-hours at market rates",
              ],
              [
                "  BigQuery storage + queries",
                "$12,000",
                "",
                "Atlas data warehouse; partitioned tables",
              ],
              [
                "  Cloud Storage / Dataflow ETL",
                "$8,000",
                "",
                "FlavorDB, USDA SR, ICMR ingestion",
              ],
              [
                "  Cloud Run / App Engine (API hosting)",
                "$7,000",
                "",
                "Clinical portal backend",
              ],
              [
                "  Secret Manager, IAM, monitoring",
                "$5,000",
                "",
                "Security + ops",
              ],
            ].map(
              (row, idx) =>
                new TableRow({
                  children: row.map((cell, cidx) =>
                    tableCell(cell, {
                      width: [4560, 1400, 800, 2600][cidx],
                      shading: idx % 2 === 0 ? ACCENT_SOFT : undefined,
                    }),
                  ),
                }),
            ),

            // Other buckets
            ...[
              [
                "CGM Supplies & Clinical",
                "$50,000",
                "10%",
                "60 participants × 2 wk × Dexcom G7 sensors",
              ],
              [
                "Publications & Dissemination",
                "$20,000",
                "4%",
                "Open-access fees, ADA/AIME travel, Zenodo/HF hosting",
              ],
              ["Patient Incentives", "$15,000", "3%", "$250 × 60 CGM cohort"],
              [
                "IRB & Compliance",
                "$5,000",
                "1%",
                "Amendment fees, data privacy audit",
              ],
              [
                "Indirect Costs (Stanford F&A, capped)",
                "$15,000",
                "3%",
                "Google.org philanthropic rate",
              ],
            ].map(
              (row, idx) =>
                new TableRow({
                  children: row.map((cell, cidx) =>
                    tableCell(p(cell, { bold: cidx === 0, after: 40 }), {
                      width: [4560, 1400, 800, 2600][cidx],
                      shading: idx % 2 === 0 ? ACCENT_SOFT : undefined,
                    }),
                  ),
                }),
            ),

            // TOTAL row
            new TableRow({
              children: [
                tableCell(
                  p("TOTAL", { bold: true, color: "FFFFFF", after: 40 }),
                  { width: 4560, shading: ACCENT },
                ),
                tableCell(
                  p("$500,000", { bold: true, color: "FFFFFF", after: 40 }),
                  { width: 1400, shading: ACCENT },
                ),
                tableCell(
                  p("100%", { bold: true, color: "FFFFFF", after: 40 }),
                  { width: 800, shading: ACCENT },
                ),
                tableCell(p("", { color: "FFFFFF", after: 40 }), {
                  width: 2600,
                  shading: ACCENT,
                }),
              ],
            }),
          ],
        }),

        p(" "),
        p(
          [
            run("Personnel weighted at 67% because Google.org funds "),
            run("work, not overhead", { bold: true }),
            run(
              ". Indirect capped at 3% matches Google.org\u2019s preferred low-indirect posture (Stanford F&A negotiated at the philanthropic rate, not the federal rate). Cloud budget assumes approximately $30,000 in additional Cloud credits awarded alongside the cash grant (standard Impact Challenge package).",
            ),
          ],
          { italics: true, color: MUTED },
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ======== 3. GOOGLE CLOUD SERVICES ========
        h1("3. Google Cloud Services"),
        p(
          "Sous is architected natively on Google Cloud. Every data path, training step, serving endpoint, and compliance control uses a specific GCP service selected for responsible AI principles and clinical-grade data handling.",
        ),

        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3000, 6360],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                headerCell("Service", 3000),
                headerCell("Primary Use", 6360),
              ],
            }),
            ...[
              [
                "Vertex AI",
                "TDA model training, endpoint deployment for meal-recommendation API, Vertex AI Experiments for reproducibility",
              ],
              [
                "Vertex AI Model Garden",
                "Starting points from open-source foundation models (including MedGemma 4B/27B for clinical summary generation)",
              ],
              [
                "BigQuery",
                "Flavor-nutrient-glycemic atlas data warehouse; partitioned tables by cuisine × ingredient × molecule",
              ],
              [
                "BigQuery ML",
                "Rapid baseline models for glycemic response prediction before TDA layers",
              ],
              [
                "Cloud Storage",
                "Raw dataset landing zone (FlavorDB, USDA SR, ICMR-NIN, CGM exports) with lifecycle policies",
              ],
              [
                "Cloud Dataflow",
                "ETL pipelines from heterogeneous dataset schemas into BigQuery canonical form",
              ],
              [
                "Compute Engine (A100/H100 GPU)",
                "TDA Mapper + persistent homology on high-dimensional flavor manifolds (giotto-tda, GUDHI)",
              ],
              [
                "Cloud Run",
                "Sous meal-recommendation API for NOURISH Clinical Portal integration",
              ],
              [
                "Cloud Healthcare API",
                "De-identification of CGM data before model ingestion",
              ],
              [
                "Identity Platform + IAM",
                "Stanford SSO integration for clinical portal; role-based data access",
              ],
              ["Secret Manager", "API keys, PHI-adjacent credentials"],
              [
                "Cloud Monitoring + Logging",
                "Pipeline observability, model drift detection",
              ],
              [
                "Cloud DLP (Data Loss Prevention)",
                "Automated PII scanning on ingestion",
              ],
              [
                "Looker Studio",
                "Clinical dashboards for NOURISH team + grant-reporting metrics",
              ],
              ["Pub/Sub", "Real-time CGM event streaming into BigQuery"],
            ].map(
              (row, idx) =>
                new TableRow({
                  children: [
                    tableCell(p(row[0], { bold: true, after: 40 }), {
                      width: 3000,
                      shading: idx % 2 === 0 ? ACCENT_SOFT : undefined,
                    }),
                    tableCell(row[1], {
                      width: 6360,
                      shading: idx % 2 === 0 ? ACCENT_SOFT : undefined,
                    }),
                  ],
                }),
            ),
          ],
        }),

        p(" "),
        p([
          run("The "),
          run("Cloud Healthcare API + Cloud DLP", { bold: true }),
          run(
            " choices are deliberate: they signal to reviewers that responsible data handling is ",
          ),
          run("architecturally baked in", { italics: true }),
          run(
            ", not an afterthought. De-identification happens at ingestion, before any modeling surface touches PHI.",
          ),
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ======== 4. DIFFERENTIATORS ========
        h1("4. Three Key Differentiators vs. Existing Nutrition AI"),

        h2(
          "Differentiator 1 — Topological Data Analysis on Flavor-Molecule Networks",
        ),
        p([
          run("Twin Health, Virta, Nutrisense, and Foodsmart all use "),
          run("neural-network embedding or rule-based recommendation", {
            italics: true,
          }),
          run(
            ". None construct topological manifolds of flavor chemistry. TDA uniquely preserves the geometric structure of \u201Cwhat makes a dish culturally coherent\u201D — a Biryani variant within the same homological class ",
          ),
          run("tastes like Biryani", { italics: true }),
          run(
            "; a variant outside the class tastes foreign. This is the mathematical formalization of the cultural-food-modification principle that all ethnographic research on dietary intervention adherence validates (a patient told to replace rice with quinoa abandons the program; a patient told to cook the same Biryani with brown basmati and more vegetables continues). No other nutrition-AI system operationalizes this rigorously.",
          ),
        ]),

        h2("Differentiator 2 — Open Foundational Dataset"),
        p([
          run(
            "Twin Health\u2019s model and data are closed. Virta\u2019s metabolic data is closed. Nutrisense\u2019s glucose-food database is closed. ",
          ),
          run(
            "Sous releases the entire flavor-nutrient-glycemic atlas under CC-BY-SA",
            { bold: true },
          ),
          run(
            ", and open-weights models on Hugging Face. This converts a private commercial asset into a ",
          ),
          run("public scientific good", { bold: true }),
          run(
            " — matching Google.org\u2019s explicit preference for open-source releases and foundational datasets that \u201Cenable future AI use cases.\u201D Downstream: any clinical team, any researcher, any app developer can build on the atlas; NOURISH + Sous remain the reference implementation but the scientific knowledge is non-rivalrous.",
          ),
        ]),

        h2(
          "Differentiator 3 — Clinical-Integration Substrate, Not Direct-to-Consumer",
        ),
        p([
          run("Twin Health, Nutrisense, Hello Heart require "),
          run("consumer acquisition and retention", { italics: true }),
          run(
            "; they compete for attention in the App Store and spend heavily on CAC. Sous deploys through the ",
          ),
          run("NOURISH Clinical Integration Portal", { bold: true }),
          run(
            " — the point-of-care handoff from physician to patient at the moment of T2D diagnosis. This is an ",
          ),
          run("opt-out distribution pattern", { bold: true, italics: true }),
          run(
            " (the doctor hands you the portal as part of standard care) versus the opt-in pattern (download an app, remember to use it) that drives 80%+ attrition in competing tools. The clinical-integration substrate also gives Sous direct access to clinically-meaningful outcome data (A1C, weight, BP, lipids) that direct-to-consumer apps never see. Combined: lower acquisition cost, higher adherence, clinical-grade measurement, and a replication pathway across any occupational health or primary care network.",
          ),
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ======== RESPONSIBLE AI & RISK ========
        h1("5. Responsible AI & Risk Statement"),
        bullet([
          run("Data privacy: ", { bold: true }),
          run(
            "All patient data de-identified at ingestion via Cloud Healthcare API + DLP scanning. No PHI leaves the Stanford clinical environment. Stanford IRB-approved protocol, renewal-eligible.",
          ),
        ]),
        bullet([
          run("Bias mitigation: ", { bold: true }),
          run(
            "Initial Indian + Filipino cuisine focus is intentional (populations most underserved by existing nutrition AI); Year 2 adds Chinese, Vietnamese, Japanese, Korean, and Latin American cohorts. Model reports confidence intervals and refuses recommendations outside training distribution.",
          ),
        ]),
        bullet([
          run("Clinical safety: ", { bold: true }),
          run(
            "Sous is positioned as a decision-support tool for clinicians and patients, not an autonomous prescriber. Every recommendation shows the underlying substitution rationale. Contraindication flags for drug-food interactions, renal dysfunction, and pregnancy.",
          ),
        ]),
        bullet([
          run("Open-science commitment: ", { bold: true }),
          run(
            "Dataset and models released within 3 months of paper acceptance. No patent filings that would restrict downstream use.",
          ),
        ]),

        // ======== TEAM ========
        h1("6. Team"),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3200, 6160],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [headerCell("Name", 3200), headerCell("Role", 6160)],
            }),
            ...[
              [
                "Stefan Thottunkal",
                "Applicant; technical lead; Macquarie MD 2026; Stanford QUAD Fellow; PCORI-funded researcher",
              ],
              [
                "Dr. Minal Moharir",
                "NOURISH Co-founder, Stanford Occupational Health clinician, Principal Investigator",
              ],
              [
                "Dr. Latha Palaniappan",
                "NOURISH Co-founder, Stanford faculty (MD, MS), health equity expert",
              ],
              [
                "Dr. Christopher Gardner",
                "Stanford Prevention Research Center, plant-based nutrition researcher, PLANT Study PI",
              ],
              [
                "Dr. Rich Wittman (MD, MPH)",
                "Medical Director, Stanford + SLAC Occupational Health Centers",
              ],
              [
                "Lily Phan / Shailaja Mathur / Dalia Perelman",
                "NOURISH Registered Dietitians",
              ],
              [
                "Dr. Ashwini Wagle",
                "SJSU South Asian nutrition expert, external validator",
              ],
            ].map(
              (row, idx) =>
                new TableRow({
                  children: [
                    tableCell(p(row[0], { bold: true, after: 40 }), {
                      width: 3200,
                      shading: idx % 2 === 0 ? ACCENT_SOFT : undefined,
                    }),
                    tableCell(row[1], {
                      width: 6160,
                      shading: idx % 2 === 0 ? ACCENT_SOFT : undefined,
                    }),
                  ],
                }),
            ),
          ],
        }),

        // ======== REFERENCES ========
        h1("7. References"),
        bullet(
          "NOURISH Genesis Document (canonical organizational record, Feb 2021 – May 2025)",
        ),
        bullet(
          "FlavorDB2: Flavor Molecule Database — Garg et al., Nucleic Acids Research, 2022",
        ),
        bullet("ICMR-NIN Indian Food Composition Tables, 2017"),
        bullet(
          "DIETFITS Trial — Gardner et al., JAMA, 2018 (Stanford Prevention Research Center)",
        ),
        bullet(
          "Virta Health Type 2 Diabetes Outcomes — Hallberg et al., Diabetes Therapy, 2018 (comparator)",
        ),
        bullet(
          "Twin Health Whole Body Digital Twin — Shamanna et al., 2021+ (comparator)",
        ),
        bullet(
          "Topological Data Analysis in Biomedical Applications — Nicolau, Carlsson, 2011+",
        ),
        bullet(
          "Google.org Responsible AI Principles — https://ai.google/responsibility/principles/",
        ),

        p(" "),
        p(
          "Draft prepared 2026-04-13 by Sous + NOURISH team. Ready for final review, PI signature, and submission by 2026-04-17.",
          { italics: true, color: MUTED, align: AlignmentType.CENTER },
        ),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(
    "/sessions/gracious-compassionate-rubin/mnt/Sous/grants/Sous-GoogleAI-for-Science-2026-Application.docx",
    buffer,
  );
  console.log("Generated: Sous-GoogleAI-for-Science-2026-Application.docx");
  console.log("Size:", buffer.length, "bytes");
});
