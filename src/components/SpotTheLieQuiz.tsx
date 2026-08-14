'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  RotateCcw,
  Flame,
  Zap,
  Bot,
  Scissors,
  HelpCircle,
  Share2,
  Copy,
  Check,
  Timer,
  Volume2,
  VolumeX,
  Award,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { LABEL_COLORS, LABEL_DISPLAY_NAMES } from '../lib/inference';
import { motion, AnimatePresence } from 'framer-motion';

export interface LegendaryQuestion {
  id: number;
  statement: string;
  speaker: string;
  context: string;
  actualLabel: string;
  aiPredictions: {
    bert: { label: string; conf: number };
    logreg: { label: string; conf: number };
  };
  explanation: string;
  justificationClue: string;
  modelReasoning: string;
}

const LEGENDARY_QUESTIONS: LegendaryQuestion[] = [
  {
    id: 1,
    statement: 'The CDC secretly admitted in court documents that COVID vaccines contain microchips.',
    speaker: 'Viral Social Media Post',
    context: 'Viral TikTok & Facebook meme',
    actualLabel: 'pants-fire',
    aiPredictions: {
      bert: { label: 'pants-fire', conf: 0.96 },
      logreg: { label: 'pants-fire', conf: 0.88 },
    },
    explanation:
      'Independent laboratory analyses, FDA public filings, and legal records confirm zero microchips or tracking hardware exist in vaccines.',
    justificationClue:
      'FDA and European Medicines Agency chemical composition audits list only mRNA, lipids, salts, and sugars.',
    modelReasoning:
      'Models heavily weight the collocation "secretly admitted" (+2.50 logit) and "microchips" (+3.10 IDF) for Pants on Fire.',
  },
  {
    id: 2,
    statement: 'The federal minimum wage has remained at $7.25 per hour since July 2009.',
    speaker: 'Economic Policy Institute',
    context: 'Congressional Budget Hearing',
    actualLabel: 'true',
    aiPredictions: {
      bert: { label: 'true', conf: 0.91 },
      logreg: { label: 'true', conf: 0.84 },
    },
    explanation:
      'Under the 2007 Fair Labor Standards Act amendment, the federal minimum wage reached $7.25 in July 2009 and has not been updated since.',
    justificationClue:
      'United States Department of Labor statutory historical wage tables confirm $7.25 has been unchanged for over 15 years.',
    modelReasoning:
      'Models detect precise numeric dates ("July 2009", "$7.25") which strongly correlate with verifiable public statute records.',
  },
  {
    id: 3,
    statement: 'Our state lost 50,000 manufacturing jobs during the last governor administration.',
    speaker: 'Campaign Attack Advertisement',
    context: 'Gubernatorial TV Debate',
    actualLabel: 'barely-true',
    aiPredictions: {
      bert: { label: 'barely-true', conf: 0.48 },
      logreg: { label: 'false', conf: 0.52 },
    },
    explanation:
      '50,000 manufacturing jobs did decline across the state, but the decline began 8 years prior during nationwide recession shifts.',
    justificationClue:
      'Bureau of Labor Statistics state employment logs show 42,000 of the 50,000 jobs were lost before the governor took office.',
    modelReasoning:
      'Models struggle on "Barely-True" because negative political rhetoric matches patterns seen in both False and Half-True claims.',
  },
  {
    id: 4,
    statement: 'Over 80% of total federal income taxes are paid by the top 20% of income earners.',
    speaker: 'Congressional Fiscal Analyst',
    context: 'Joint Economic Committee Briefing',
    actualLabel: 'mostly-true',
    aiPredictions: {
      bert: { label: 'mostly-true', conf: 0.74 },
      logreg: { label: 'half-true', conf: 0.44 },
    },
    explanation:
      'According to Congressional Budget Office data, the top quintile pays between 78% and 81% of total federal income taxes depending on the tax year.',
    justificationClue:
      'CBO Distribution of Household Income analysis calculates the top quintile share at 79.4% in 2021.',
    modelReasoning:
      'BERT captures the statistical distribution nuance ("top 20%", "80%"), recognizing empirical economic reporting phrasing.',
  },
  {
    id: 5,
    statement: 'My political opponent voted to completely eliminate Social Security benefits for all current American retirees.',
    speaker: 'Senatorial Campaign Speech',
    context: 'Campaign Rally Speech',
    actualLabel: 'false',
    aiPredictions: {
      bert: { label: 'false', conf: 0.82 },
      logreg: { label: 'pants-fire', conf: 0.61 },
    },
    explanation:
      'The opponent voted on an overall discretionary budget spending cap that exempts Medicare and Social Security from cuts.',
    justificationClue:
      'Congressional Record roll call vote #142 explicitly listed Title II Old-Age benefits as exempt from automatic sequester.',
    modelReasoning:
      'Deceptive exaggeration terms ("completely eliminate", "all current retirees") trigger strong negative linear classifier coefficients.',
  },
  {
    id: 6,
    statement: 'The United States produces more crude oil than any nation in global history.',
    speaker: 'Energy Industry Whitepaper',
    context: 'Energy Information Report',
    actualLabel: 'true',
    aiPredictions: {
      bert: { label: 'true', conf: 0.89 },
      logreg: { label: 'mostly-true', conf: 0.58 },
    },
    explanation:
      'U.S. crude oil production surpassed 13.3 million barrels per day in late 2023, higher than any monthly output ever recorded by Saudi Arabia or Russia.',
    justificationClue:
      'U.S. Energy Information Administration (EIA) international petroleum statistics confirm all-time global production high.',
    modelReasoning:
      'Lexical models identify comparative superlative phrases ("more crude oil than any nation") and evaluate corroborating domain keywords.',
  },
];

export const SpotTheLieQuiz: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userScore, setUserScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [bertScore, setBertScore] = useState<number>(0);
  const [logregScore, setLogregScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Lifelines
  const [usedAiHint, setUsedAiHint] = useState<boolean>(false);
  const [showAiHint, setShowAiHint] = useState<boolean>(false);
  const [used5050, setUsed5050] = useState<boolean>(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [usedEvidenceClue, setUsedEvidenceClue] = useState<boolean>(false);
  const [showEvidenceClue, setShowEvidenceClue] = useState<boolean>(false);

  // Timer & Sound
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQ = LEGENDARY_QUESTIONS[currentIdx];

  // Synthesize Web Audio Chimes (Zero external assets needed!)
  const playSoundEffect = (type: 'correct' | 'wrong' | 'win') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'correct') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.3);
          osc.start(ctx.currentTime + i * 0.12);
          osc.stop(ctx.currentTime + i * 0.12 + 0.3);
        });
      }
    } catch (e) {
      // Audio fallback silent
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!isModalOpen || quizCompleted || selectedAnswer !== null || !isTimerActive) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isModalOpen, quizCompleted, selectedAnswer, isTimerActive, currentIdx]);

  const handleTimeOut = () => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer('TIMEOUT');
    setStreak(0);
    playSoundEffect('wrong');

    // Update AI scores
    if (currentQ.aiPredictions.bert.label === currentQ.actualLabel) {
      setBertScore((b) => b + 100);
    }
    if (currentQ.aiPredictions.logreg.label === currentQ.actualLabel) {
      setLogregScore((l) => l + 100);
    }
  };

  const handleSelectOption = (label: string) => {
    if (selectedAnswer !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedAnswer(label);
    const isCorrect = label === currentQ.actualLabel;

    if (isCorrect) {
      const multiplier = streak >= 2 ? 3 : streak === 1 ? 2 : 1;
      const speedBonus = Math.round(timeLeft * 5);
      const points = 100 * multiplier + speedBonus;
      setUserScore((prev) => prev + points);
      setStreak((prev) => {
        const nextStreak = prev + 1;
        if (nextStreak > maxStreak) setMaxStreak(nextStreak);
        return nextStreak;
      });
      playSoundEffect('correct');
    } else {
      setStreak(0);
      playSoundEffect('wrong');
    }

    // Update AI models performance
    if (currentQ.aiPredictions.bert.label === currentQ.actualLabel) {
      setBertScore((b) => b + 100);
    }
    if (currentQ.aiPredictions.logreg.label === currentQ.actualLabel) {
      setLogregScore((l) => l + 100);
    }
  };

  const handleUse5050 = () => {
    if (used5050 || selectedAnswer !== null) return;
    setUsed5050(true);
    const allLabels = Object.keys(LABEL_DISPLAY_NAMES);
    const incorrect = allLabels.filter((l) => l !== currentQ.actualLabel);
    // Eliminate 3 random incorrect options
    const toEliminate = incorrect.sort(() => 0.5 - Math.random()).slice(0, 3);
    setEliminatedOptions(toEliminate);
  };

  const handleUseAiHint = () => {
    if (usedAiHint || selectedAnswer !== null) return;
    setUsedAiHint(true);
    setShowAiHint(true);
  };

  const handleUseEvidenceClue = () => {
    if (usedEvidenceClue || selectedAnswer !== null) return;
    setUsedEvidenceClue(true);
    setShowEvidenceClue(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowAiHint(false);
    setShowEvidenceClue(false);
    setEliminatedOptions([]);
    setTimeLeft(20);

    if (currentIdx + 1 < LEGENDARY_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
      playSoundEffect('win');
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setUserScore(0);
    setStreak(0);
    setMaxStreak(0);
    setBertScore(0);
    setLogregScore(0);
    setQuizCompleted(false);
    setUsedAiHint(false);
    setShowAiHint(false);
    setUsed5050(false);
    setEliminatedOptions([]);
    setUsedEvidenceClue(false);
    setShowEvidenceClue(false);
    setTimeLeft(20);
  };

  const getRankBadge = (score: number) => {
    if (score >= 1200) {
      return {
        title: '🌟 Grand Fact-Check Arbiter (Legendary)',
        badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-400',
        desc: 'You completely out-reasoned the BERT Transformer and AI models with pinpoint truthfulness discernment!',
      };
    }
    if (score >= 800) {
      return {
        title: '🕵️ Senior Investigative Fact-Checker',
        badgeColor: 'text-purple-300 bg-purple-500/20 border-purple-400',
        desc: 'Outstanding fact-checking acumen! You demonstrated razor-sharp deception signal detection.',
      };
    }
    if (score >= 400) {
      return {
        title: '🔍 PolitiFact Contributing Analyst',
        badgeColor: 'text-blue-300 bg-blue-500/20 border-blue-400',
        desc: 'Solid intuition! You caught multiple high-profile political falsehoods and nuanced claims.',
      };
    }
    return {
      title: '📰 Rookie Newsroom Intern',
      badgeColor: 'text-slate-300 bg-slate-800 border-slate-700',
      desc: 'Good start! Practice observing TF-IDF token weights and subtle campaign rhetoric tricks.',
    };
  };

  const rank = getRankBadge(userScore);

  const handleCopyBrag = () => {
    const text = `🏆 PolitiFact AI Studio Fact-Checker Challenge:\nMy Score: ${userScore} PTS\nRank: ${rank.title}\nMax Streak: ${maxStreak}🔥\nCan you beat my fact-checking score?`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 font-sans text-slate-200">
      {/* Featured Quiz Launcher Banner */}
      <div className="bg-gradient-to-r from-[#111827] via-[#2A174E]/40 to-[#111827] p-6 sm:p-8 rounded-2xl border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2.5 text-center md:text-left z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Gamepad2 className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Legendary Fact-Checker Arena • Human vs. AI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-masthead font-bold text-white tracking-tight">
            Can You Spot the Truth Better Than BERT & AI?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl font-sans">
            Step into the arena! Test your judgment on 6 viral claims with speed timers, multiplier streaks, AI hints, and a live dual scoreboard vs BERT Transformer.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-purple-400" /> Multiplier Streaks</span>
            <span className="flex items-center gap-1"><Scissors className="w-3.5 h-3.5 text-indigo-400" /> 50/50 Lifeline</span>
            <span className="flex items-center gap-1"><Bot className="w-3.5 h-3.5 text-fuchsia-400" /> Live AI Scoreboard</span>
          </div>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            handleRestartQuiz();
          }}
          className="px-7 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-sm transition-all shadow-xl shadow-purple-500/25 flex items-center gap-2.5 whitespace-nowrap z-10 transform hover:scale-105 active:scale-95 border border-purple-400/30"
        >
          <Gamepad2 className="w-5 h-5 text-purple-200" />
          <span>Enter Challenge Arena</span>
        </button>
      </div>

      {/* Arena Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in font-sans">
          <div className="bg-[#111827] p-5 sm:p-7 rounded-2xl max-w-3xl w-full space-y-5 border border-slate-800 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Top Bar: Question Count, Score, Streaks & Sound */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 font-mono text-xs">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 rounded-lg bg-[#0B0F17] border border-slate-800 text-amber-400 font-bold">
                  Q {currentIdx + 1} / {LEGENDARY_QUESTIONS.length}
                </span>

                {/* Multiplier Streak */}
                {streak > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{streak}x Streak ({streak >= 2 ? '3x PTS' : '2x PTS'})</span>
                  </div>
                )}
              </div>

              {/* Dual Scoreboard */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-1.5 bg-[#0B0F17] px-3 py-1 rounded-lg border border-slate-800">
                  <span className="text-slate-400">You:</span>
                  <strong className="text-amber-400 font-bold">{userScore} PTS</strong>
                </div>

                <div className="flex items-center gap-1.5 bg-[#0B0F17] px-3 py-1 rounded-lg border border-slate-800">
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-400">BERT:</span>
                  <strong className="text-purple-400 font-bold">{bertScore} PTS</strong>
                </div>

                {/* Sound Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-lg bg-[#0B0F17] border border-slate-800 text-slate-400 hover:text-white"
                  title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                </button>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-2.5 py-1 bg-[#0B0F17] hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-slate-800"
                >
                  Exit
                </button>
              </div>
            </div>

            {!quizCompleted ? (
              <div className="space-y-5">
                {/* Timer Bar */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'text-rose-400 animate-spin' : 'text-purple-400'}`} />
                      <span>Speed Bonus Window:</span>
                    </span>
                    <span className={timeLeft <= 5 ? 'text-rose-400 font-bold animate-pulse text-xs sm:text-sm' : 'text-white font-bold text-xs sm:text-sm'}>
                      {timeLeft}s (+{timeLeft * 5} bonus pts)
                    </span>
                  </div>
                  <div className="w-full bg-[#0B0F17] h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        timeLeft <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                      }`}
                      style={{ width: `${(timeLeft / 20) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Statement Card */}
                <div className="bg-[#0B0F17] p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm font-mono font-bold text-purple-300 uppercase tracking-wider">
                      Speaker: {currentQ.speaker}
                    </span>
                    <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                      Context: {currentQ.context}
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-medium text-white leading-relaxed font-sans italic">
                    &quot;{currentQ.statement}&quot;
                  </p>
                </div>

                {/* Lifeline Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                  <span className="text-slate-300 text-xs uppercase font-bold tracking-wider">
                    Available Lifelines:
                  </span>
                  <div className="flex items-center gap-2">
                    {/* 50/50 Lifeline */}
                    <button
                      onClick={handleUse5050}
                      disabled={used5050 || selectedAnswer !== null}
                      className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition-all text-xs ${
                        used5050
                          ? 'opacity-30 border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
                          : 'bg-[#0B0F17] hover:bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:border-indigo-500'
                      }`}
                    >
                      <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                      <span>50/50 Lifeline</span>
                    </button>

                    {/* AI Model Hint */}
                    <button
                      onClick={handleUseAiHint}
                      disabled={usedAiHint || selectedAnswer !== null}
                      className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition-all text-xs ${
                        usedAiHint
                          ? 'opacity-30 border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
                          : 'bg-[#0B0F17] hover:bg-purple-600/20 text-purple-300 border-purple-500/40 hover:border-purple-500'
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                      <span>Ask AI Models</span>
                    </button>

                    {/* Evidence Clue */}
                    <button
                      onClick={handleUseEvidenceClue}
                      disabled={usedEvidenceClue || selectedAnswer !== null}
                      className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition-all text-xs ${
                        usedEvidenceClue
                          ? 'opacity-30 border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
                          : 'bg-[#0B0F17] hover:bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:border-emerald-500'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Evidence Clue</span>
                    </button>
                  </div>
                </div>

                {/* AI Hint Revelation Box */}
                {showAiHint && (
                  <div className="bg-purple-950/20 border border-purple-500/30 p-3.5 rounded-xl font-mono text-xs text-purple-200 space-y-1 animate-fade-in">
                    <span className="font-bold flex items-center gap-1.5 text-purple-300">
                      <Bot className="w-4 h-4 text-purple-400" /> Model Predictions for this claim:
                    </span>
                    <div className="flex flex-wrap gap-4 pt-1">
                      <span>BERT Transformer: <strong className="text-white uppercase">{LABEL_DISPLAY_NAMES[currentQ.aiPredictions.bert.label]}</strong> ({(currentQ.aiPredictions.bert.conf * 100).toFixed(0)}% conf)</span>
                      <span>Logistic Regression: <strong className="text-white uppercase">{LABEL_DISPLAY_NAMES[currentQ.aiPredictions.logreg.label]}</strong> ({(currentQ.aiPredictions.logreg.conf * 100).toFixed(0)}% conf)</span>
                    </div>
                  </div>
                )}

                {/* Evidence Clue Revelation Box */}
                {showEvidenceClue && (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl text-xs text-emerald-200 space-y-1 animate-fade-in font-sans">
                    <span className="font-mono font-bold flex items-center gap-1.5 text-emerald-300 uppercase text-[11px]">
                      <Search className="w-3.5 h-3.5 text-emerald-400" /> PolitiFact Investigator Clue:
                    </span>
                    <p className="italic leading-relaxed">{currentQ.justificationClue}</p>
                  </div>
                )}

                {/* Rating Options Grid */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Choose PolitiFact Ruling:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                    {Object.keys(LABEL_DISPLAY_NAMES).map((lbl) => {
                      const isSelected = selectedAnswer === lbl;
                      const isCorrect = lbl === currentQ.actualLabel;
                      const isEliminated = eliminatedOptions.includes(lbl);
                      const showResult = selectedAnswer !== null;

                      let btnStyle = 'bg-[#0B0F17] text-slate-300 border-slate-800 hover:border-amber-500/60 hover:text-white';
                      if (isEliminated) {
                        btnStyle = 'opacity-20 border-slate-900 bg-slate-950 text-slate-700 line-through cursor-not-allowed';
                      } else if (showResult) {
                        if (isCorrect) btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold shadow-[0_0_12px_#10B98133]';
                        else if (isSelected && !isCorrect) btnStyle = 'bg-rose-500/20 text-rose-300 border-rose-500 font-bold';
                        else btnStyle = 'bg-[#0B0F17] text-slate-600 border-slate-800/40 opacity-40';
                      }

                      return (
                        <button
                          key={lbl}
                          onClick={() => handleSelectOption(lbl)}
                          disabled={showResult || isEliminated}
                          className={`p-3.5 rounded-xl text-center transition-all border font-bold text-xs flex items-center justify-center gap-2 ${btnStyle}`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: LABEL_COLORS[lbl] || '#64748B' }}
                          />
                          <span>{LABEL_DISPLAY_NAMES[lbl]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Answer Feedback & Showdown */}
                {selectedAnswer !== null && (
                  <div className="space-y-4 pt-3 border-t border-slate-800 animate-fade-in font-sans">
                    <div
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        selectedAnswer === currentQ.actualLabel
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-sm">
                        <div className="flex items-center space-x-2">
                          {selectedAnswer === currentQ.actualLabel ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              <span>Spot on! Ground Truth: {LABEL_DISPLAY_NAMES[currentQ.actualLabel]}</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-rose-400" />
                              <span>
                                {selectedAnswer === 'TIMEOUT' ? 'Time Expired!' : 'Incorrect.'} Ground Truth: {LABEL_DISPLAY_NAMES[currentQ.actualLabel]}
                              </span>
                            </>
                          )}
                        </div>

                        {selectedAnswer === currentQ.actualLabel && (
                          <span className="text-emerald-400 font-bold">
                            +{100 * (streak >= 2 ? 3 : streak === 1 ? 2 : 1) + Math.round(timeLeft * 5)} PTS
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed font-sans text-slate-200">{currentQ.explanation}</p>
                    </div>

                    {/* AI Showdown Comparison Callout */}
                    <div className="bg-[#0B0F17] p-4 rounded-xl border border-purple-500/30 text-xs text-slate-200 space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-purple-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-purple-400" /> AI Head-to-Head Comparison:
                        </span>
                        <span>
                          BERT: {currentQ.aiPredictions.bert.label === currentQ.actualLabel ? '✅ Correct' : '❌ Wrong'} • LogReg: {currentQ.aiPredictions.logreg.label === currentQ.actualLabel ? '✅ Correct' : '❌ Wrong'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{currentQ.modelReasoning}</p>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25 border border-purple-400/30"
                      >
                        <span>Next Claim</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Legendary Quiz Victory / Completion Screen */
              <div className="text-center py-6 space-y-6 font-sans">
                <div className="inline-block p-4 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Trophy className="w-14 h-14 animate-bounce mx-auto" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-masthead font-bold text-white">Challenge Completed!</h3>
                  <div className={`inline-block px-4 py-1 rounded-full text-xs font-mono font-bold border uppercase tracking-wider ${rank.badgeColor}`}>
                    {rank.title}
                  </div>
                  <p className="text-xs text-slate-400 font-sans max-w-md mx-auto pt-1">
                    {rank.desc}
                  </p>
                </div>

                {/* Scoreboard Metrics Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto font-mono text-xs">
                  <div className="bg-[#0B0F17] p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Your Total</span>
                    <span className="text-lg font-bold text-purple-400 block">{userScore} PTS</span>
                  </div>
                  <div className="bg-[#0B0F17] p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">BERT Total</span>
                    <span className="text-lg font-bold text-indigo-400 block">{bertScore} PTS</span>
                  </div>
                  <div className="bg-[#0B0F17] p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Max Streak</span>
                    <span className="text-lg font-bold text-emerald-400 block">{maxStreak}🔥</span>
                  </div>
                  <div className="bg-[#0B0F17] p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">AI Outcome</span>
                    <span className="text-sm font-bold text-white block mt-1">
                      {userScore >= bertScore ? '🏆 Beat BERT!' : '🤖 BERT Won'}
                    </span>
                  </div>
                </div>

                {/* Takeaway */}
                <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 max-w-lg mx-auto text-xs text-slate-300 leading-relaxed text-left font-sans space-y-1">
                  <strong className="text-purple-400 font-mono font-bold block">💡 Fact-Checking Takeaway:</strong>
                  <span>NLP models look for token statistical signatures and n-gram patterns, while human fact-checkers look for factual plausibility and source integrity. Together, hybrid human-AI teams achieve the highest accuracy!</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center items-center gap-3 pt-2 font-mono text-xs">
                  <button
                    onClick={handleCopyBrag}
                    className="px-5 py-2.5 rounded-xl bg-[#0B0F17] hover:bg-slate-800 text-purple-300 border border-purple-500/40 font-bold transition-all flex items-center gap-2 shadow-md"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
                    <span>{copied ? 'Copied Brag Text!' : 'Share Score'}</span>
                  </button>

                  <button
                    onClick={handleRestartQuiz}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-500/25 border border-purple-400/30"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Again</span>
                  </button>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#0B0F17] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-bold transition-all"
                  >
                    Exit Arena
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
