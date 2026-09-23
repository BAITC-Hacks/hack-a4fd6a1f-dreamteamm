'use client';

import React, { useState } from 'react';
import { ReadinessScoreResult } from '@/lib/types';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface ReadinessScoreWidgetProps {
  score: number;
  readiness?: ReadinessScoreResult;
  showDetailsDefault?: boolean;
  interactive?: boolean;
}

export default function ReadinessScoreWidget({
  score,
  readiness,
  showDetailsDefault = false,
  interactive = true
}: ReadinessScoreWidgetProps) {
  const [showDetails, setShowDetails] = useState(showDetailsDefault);

  const getScoreColor = (val: number) => {
    if (val >= 80) return {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      bar: 'bg-emerald-500',
      text: 'text-emerald-700',
      label: 'High Readiness (Ready to Publish)',
      description: 'Well-specified deliverables, stack requirements, and clear scope.'
    };
    if (val >= 50) return {
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      bar: 'bg-amber-500',
      text: 'text-amber-700',
      label: 'Moderate Readiness (Needs Minor Refinement)',
      description: 'Covers the basics, but adding specific deliverables will attract stronger student proposals.'
    };
    return {
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      bar: 'bg-rose-500',
      text: 'text-rose-700',
      label: 'Low Readiness (Draft / Needs Info)',
      description: 'Lacks core details. Elaborate on deliverables, deadlines, and technical requirements.'
    };
  };

  const status = getScoreColor(score);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      {/* Header & Gauge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {/* Score pill circle */}
            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold border ${status.badge}`}>
              <span className="text-xl leading-none">{score}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-500">/ 100</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
                Task Readiness Score
              </h4>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${status.badge}`}>
                {score >= 80 ? 'Ready' : score >= 50 ? 'Refine' : 'Incomplete'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {status.description}
            </p>
          </div>
        </div>

        {interactive && readiness && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors self-end sm:self-center bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
          >
            <span>{showDetails ? 'Hide Quality Audit' : 'View Quality Audit'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-4">
        <div 
          className={`h-full transition-all duration-500 ease-out ${status.bar}`}
          style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
        />
      </div>

      {/* Itemized Audit Breakdown Details */}
      {showDetails && readiness && (
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-4 text-xs animate-in fade-in duration-200">
          <div>
            <h5 className="font-semibold text-slate-800 flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Quality Breakdown & Evaluation Criteria
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {readiness.breakdown.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                    item.passed ? 'bg-slate-50/70 border-slate-200' : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-medium text-slate-800">
                      <span>{item.label}</span>
                      <span className={item.passed ? 'text-emerald-700' : 'text-slate-500'}>
                        {item.points} / {item.maxPoints} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {item.suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Suggestions */}
          {readiness.suggestions && readiness.suggestions.length > 0 && (
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3">
              <h6 className="font-semibold text-indigo-900 flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                Recommendations to reach 90+ Score:
              </h6>
              <ul className="space-y-1 pl-4 list-disc text-indigo-800 text-[11px]">
                {readiness.suggestions.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
