# 🏛️ VeritasAI — Political Fact-Checking & NLP Research Studio

An interactive, portfolio-quality Next.js web application built on the **LIAR-PLUS political statement truthfulness benchmark** (~12,800 PolitiFact claims across 6 fine-grained truthfulness classes).

Designed for professors, recruiters, and NLP researchers to explore both **live real-time model predictions** and **visual research findings** in a sleek, data-journalism format.

---

## ✨ Features Overview

1. **⚡ Live Truthometer (0ms Client-Side Inference Engine)**:
   - Evaluates any claim across 6 ratings (`Pants-Fire`, `False`, `Barely-True`, `Half-True`, `Mostly-True`, `True`).
   - Runs TF-IDF + Logistic Regression inference directly in TypeScript in the browser with **0ms server latency**.
   - Side-by-side or toggle comparison between **Statement Only** vs **Statement + Evidence**.
   - Interactive X-Ray token heatmap highlighting discriminative keywords.
   - Pre-loaded example claim chips (1 per class) for 1-click testing.

2. **📊 Interactive Benchmark Dashboard**:
   - Compares 11 model configurations (Classical ML, RNN family, BiLSTM, Ensemble, BERT Base) on Accuracy and Macro-F1.
   - Filterable by input condition (`stmt_only` vs `stmt_just`).
   - Interactive Confusion Matrix viewer with dropdown selection and normalized recall heatmaps.
   - Highlight cards for Best Model (BiLSTM) and Model Anomaly (GRU gradient collapse).

3. **📖 Visual Research Story (Scrollytelling Report)**:
   - **Ablation Study**: Grouped bar chart with McNemar significance test annotation ($\chi^2=1.9824, p=0.1591 > 0.05$).
   - **t-SNE Scatter Plot**: 2D projection of TF-IDF statement embeddings illustrating intrinsic class overlap.
   - **Prediction Agreement Heatmap**: Pairwise inter-model prediction agreement matrix explaining why ensembling only marginally improved performance due to correlated errors.

4. **🎓 About & Methodology Page**:
   - Executive summary of LIAR-PLUS dataset, experimental setup, and takeaways.
   - Course credits (CSE440 Natural Language Processing II).

---

## 🛠️ Local Development Setup

```bash
# 1. Navigate to politifact_ai_studio folder
cd politifact_ai_studio

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐍 How to Export Your Trained Python Model

To export your own trained scikit-learn `TfidfVectorizer` + `LogisticRegression` model from `LIAR_PLUS_Classification_Project.ipynb`:

```bash
python scripts/export_model.py --data_dir ./liar_plus_data --output ./politifact_ai_studio/public/data/model_weights.json
```

This generates `public/data/model_weights.json` containing vocabulary indices, IDF vector, and coefficient matrices loaded automatically by the TypeScript inference engine.

---

## 🚀 How to Deploy to Vercel (1-Click)

### Option A: Vercel CLI
```bash
cd politifact_ai_studio
npx vercel
```

### Option B: Vercel Dashboard (GitHub)
1. Push `politifact_ai_studio` (or the repository root) to GitHub.
2. Import the repository on [Vercel Dashboard](https://vercel.com/new).
3. Vercel automatically detects Next.js, builds with `npm run build`, and deploys instantly!

---

## 💼 CV / Resume Showcase Bullets

* **Developed & Deployed Interactive NLP Research Web App**: Built Next.js App Router application classifying 12.8k+ political claims into a 6-point truthfulness scale with zero serverless cold start.
* **Engineered Client-Side Inference Engine**: Implemented custom TypeScript TF-IDF vectorization & Logistic Regression matrix multiplication executing in <10ms directly in the browser.
* **Visualized Statistical Significance & Model Ablation**: Created interactive Recharts & t-SNE scatter dashboards demonstrating McNemar significance results ($p=0.1591$) and inter-model agreement metrics.
