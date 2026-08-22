# 🏛️ PolitiFact AI Studio : Neural Truthometer & Empirical NLP Research Suite

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.35-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

> **An interactive, publication-grade NLP research studio and real-time inference cockpit evaluating political statement veracity on the LIAR-PLUS benchmark (12,836 PolitiFact claims across 6 fine-grained truth levels).**

---

## 🌟 Executive Summary & Key Research Highlights

Built for NLP researchers, data journalists, and engineers, **PolitiFact AI Studio** bridges the gap between deep academic exploration and production-grade interactive software. It allows users to run instant, real-time client-side model predictions and inspect empirical benchmarking across **10 neural and classical architectures** (BERT Base, BiLSTM, BiGRU, LSTM, GRU, RNNs, Random Forest, Logistic Regression, Naive Bayes).

### 🔍 Core Findings Embedded in the Studio:
1. **Evidence Ablation McNemar Test ($p = 0.1591 > 0.05$)**: 
   Rigorous statistical paired hypothesis testing reveals that providing human fact-checker evidence does **not** yield a statistically significant accuracy boost over evaluating the claim statement alone.
2. **Transformer Superiority**:
   **BERT Base** achieves the top 6-way classification benchmark on the test dataset ($27.1\%$ Accuracy, $0.2684$ Macro-F1).
3. **Recurrent Mode Collapse**:
   Standard GRU and LSTM architectures suffer from severe mode collapse when trained with combined statement + justification text (Macro-F1 drops to $0.076$ and $0.092$ as models collapse into single-class majority guessing).

---

## 🧭 The Four Interactive Research Hubs

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           POLITIFACT AI STUDIO                              │
├───────────────────────┬────────────────────────┬────────────────────────────┤
│ 1. Fact-Check Studio  │ 2. Neural Labs         │ 3. Research Leaderboard    │
│    (Warm Gold #F59E0B)│    (Indigo/Cyan #6366) │    (Emerald Green #10B981) │
├───────────────────────┴────────────────────────┴────────────────────────────┤
│ 4. Playgrounds, Quizzes & Hyperparameter Sandboxes (Cyber Violet #A855F7)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🟡 Hub 1: Fact-Check Studio (Real-Time Prediction Workbench)
- **⚡ 0ms Client-Side Inference Cockpit**: Evaluates any custom statement or preset across the 6-point PolitiFact spectrum (`Pants-Fire`, `False`, `Barely-True`, `Half-True`, `Mostly-True`, `True`).
- **🎛️ 4 Switchable Live Engines**: Switch instantaneously between **Logistic Regression**, **Random Forest**, **BiLSTM Recurrent**, and **BERT Transformer** predictions.
- **🌡️ Calibrated Truthometer Gauge**: High-tech SVG animated dial with a calibrated continuous Truth Index ($0$ to $100$) and 6-class probability distribution bars.
- **🔬 Token Attribution Heatmap**: Real-time TF-IDF feature attribution highlighting the exact vocabulary tokens driving positive vs. deceptive logit weights.
- **🎲 Political Spin & Word-Swap Simulator**: Click any word in a statement to open synonym popovers (categorized into `🟢 Fact`, `🔴 Spin`, and `🟡 Neutral`) or trigger the **Random Chaos Spin** to observe how subtle keyword perturbations cause real-time truth index swings.
- **📖 Truth Spectrum Guide**: Interactive reference guide detailing editorial criteria and canonical examples for all 6 truth categories.

---

### 🔵 Hub 2: Neural Labs (Architecture & Pipeline Mechanics)
- **📡 Multi-Model Comparison Radar Matrix**: Side-by-side performance radar and latency/parameter telemetry comparing 10 models simultaneously.
- **🔄 4-Stage End-to-End Pipeline Simulator**: Step-by-step interactive visualizer tracing text flow through **EDA & Cleaning ➔ Embeddings / Vectorization ➔ Hidden Neural Layers ➔ Softmax Calibration** with an auto-playback engine.
- **🌲 Decision Tree Logic Simulator**: Demonstrates how ensemble decision boundaries branch on token threshold splits.
- **👤 Bayesian Speaker Credibility Prior Simulator**: Test politicians (Obama, Trump, Sanders, Clinton, Biden, or Custom) to see how historical ruling priors condition baseline Bayesian prediction logits.

---

### 🟢 Hub 3: Research Leaderboard & Empirical Analysis
- **🏆 Master Benchmark Leaderboard**: Ground-truth test evaluation on 1,283 test claims across all input representations (`stmt_only` vs. `stmt_just`).
- **📊 6×6 Normalized Confusion Matrix**: Interactive matrix with cell hover inspectors revealing exact true vs. predicted counts and normalized percentages.
- **🧭 2D t-SNE Embedding Explorer**: Interactive canvas projecting 150 statement embeddings in 2D vector space, illustrating semantic overlap and linguistic boundaries.
- **📖 Scrollytelling Visual Research Story**: 6-chapter narrative walking through data distributions, feature importance, ablation significance, and ensembling trade-offs.
- **📝 Academic Methodology & About Page**: Complete project documentation, methodology notes, and built-in Jupyter Notebook viewer.

---

### 🟣 Hub 4: Playgrounds, Quiz & Optimization Sandboxes
- **🎮 Spot The Lie Challenge**: 10-round gamified quiz with speed-bonus countdown timer, dual-scoring (Human vs. BERT AI), and 3 lifelines:
  - ✂️ *50/50 Lifeline* (eliminates 2 incorrect classes)
  - 🤖 *Ask AI Models* (reveals multi-engine consensus)
  - 🔍 *Evidence Clue* (unlocks context justification)
- **💾 Custom Claim Benchmark Suite**: Create custom test claims, compare Statement-Only vs. Statement+Evidence verdicts, and export research reports to **CSV** or **JSON**.
- **🎛️ Live Hyperparameter Sandbox**: Real-time tuning slider for L2 regularization ($C$), unigram/bigram vocabulary extraction windows, and sublinear TF scaling.
- **⚔️ Head-to-Head Claim Face-Off**: Direct side-by-side battle comparing two competing political statements with a comparative victory meter.
- **🧪 Interactive Learning Lab**: 4 conceptual modules with built-in knowledge-check quizzes.

---

## 🛠️ Technology Stack & Architecture

| Layer | Technologies Used |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, React 18, Server Components & Static Prerendering) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict type-safety, zero build warnings) |
| **Styling & Design** | [Tailwind CSS](https://tailwindcss.com/), Glassmorphism, Multi-radial Aurora Meshes, CSS Grid |
| **Icons & Animation**| [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/) |
| **ML & Data Pipeline**| Scikit-Learn, PyTorch, HuggingFace Transformers, TF-IDF Vectorizer |
| **Datasets** | [LIAR-PLUS Benchmark](https://github.com/Tariq60/LIAR-PLUS) (12,836 PolitiFact statements) |
| **Deployment** | [Vercel Edge Platform](https://vercel.com/) |

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Clone and Install
```bash
# Clone repository
git clone https://github.com/RizviIqbal/politifact-ai-studio.git
cd politifact-ai-studio

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Repository Structure

```tree
politifact_ai_studio/
├── public/
│   ├── CSE440_Project_.ipynb        # Full Google Colab / Jupyter Research Notebook
│   └── data/
│       ├── model_weights.json       # Vocabulary, IDF weights & 6-class coefficients
│       ├── master_results.json      # Ground-truth accuracy & Macro-F1 leaderboard
│       ├── confusion_matrices.json  # 6x6 confusion matrices across 4 models
│       ├── tsne_points.json         # 2D t-SNE coordinate projections
│       ├── example_statements.json  # Curated test statements
│       └── prediction_agreement.json# Inter-model agreement matrix
├── src/
│   ├── app/
│   │   ├── globals.css              # Obsidian studio theme & ambient lighting
│   │   ├── layout.tsx               # Root layout & font definitions
│   │   └── page.tsx                 # Master 4-hub container & navigation state
│   ├── components/
│   │   ├── StudioLogo.tsx           # Custom vector truthometer brandmark
│   │   ├── Header.tsx               # Header toolbar with hub breadcrumbs
│   │   ├── SidebarNav.tsx           # Collapsible side dock navigation
│   │   ├── HeroPredictionDemo.tsx   # Hub 1: Main prediction workbench
│   │   ├── LiveWordEditor.tsx       # Hub 1: Keyword perturbation simulator
│   │   ├── TruthSpectrumGuide.tsx   # Hub 1: 6-level taxonomy criteria
│   │   ├── ArchitecturePipelineSimulator.tsx # Hub 2: 4-stage pipeline flow
│   │   ├── MultiModelComparisonMatrix.tsx    # Hub 2: Model radar comparison
│   │   ├── SpeakerCredibilitySimulator.tsx   # Hub 2: Bayesian prior conditioning
│   │   ├── ModelComparisonDashboard.tsx      # Hub 3: Leaderboard & confusion matrices
│   │   ├── TsneInteractiveExplorer.tsx       # Hub 3: 2D embedding scatter plot
│   │   ├── ResearchStoryScrolly.tsx          # Hub 3: Scrollytelling report
│   │   ├── AboutResearch.tsx        # Hub 3: Project credits & methodology
│   │   ├── SpotTheLieQuiz.tsx       # Hub 4: Spot the Lie game & lifelines
│   │   ├── CustomClaimBenchmark.tsx # Hub 4: Batch testing & CSV/JSON export
│   │   ├── HyperparameterSandbox.tsx# Hub 4: L2 C slider & N-gram sandbox
│   │   ├── ClaimFaceOff.tsx         # Hub 4: Head-to-head claim comparator
│   │   ├── StudioTourModal.tsx      # Interactive app onboarding modal
│   │   ├── NotebookModal.tsx        # Jupyter code viewer with copy buttons
│   │   └── Footer.tsx               # Footer with dataset citations & repo links
│   └── lib/
│       ├── inference.ts             # Mathematical multi-engine prediction logic
│       ├── data.ts                  # Static data loaders and fallback metrics
│       └── ModelContext.tsx         # React Context for global model state
├── LICENSE                          # MIT License
├── package.json
└── README.md
```

---

## 📜 Academic Dataset Citation

If you use or reference this project, please cite the underlying **LIAR** and **LIAR-PLUS** benchmarks:

```bibtex
@inproceedings{wang2017liar,
  title={"Liar, Liar Pants on Fire": A New Benchmark Dataset for Fake News Detection},
  author={Wang, William Yang},
  booktitle={Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (ACL)},
  pages={422--426},
  year={2017}
}

@inproceedings{alhindi2018where,
  title={Where is Your Evidence: Improving Fact-Checking by Justification Modeling},
  author={Alhindi, Tariq and Petridis, Savvas and Muresan, Smaranda},
  booktitle={Proceedings of the First Workshop on Fact Extraction and VERification (FEVER)},
  pages={85--90},
  year={2018}
}
```

---

## ⚖️ License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

---

<div align="center">
  <sub>Developed for CSE 440 (Natural Language Processing) • Built using Next.js & TypeScript</sub>
</div>
