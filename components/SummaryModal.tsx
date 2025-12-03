import React from 'react';
import { SourceItem } from '../types';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: SourceItem | null;
  summary: string;
  isLoading: boolean;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, source, summary, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-stone-50 rounded-lg shadow-xl max-w-2xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-white flex justify-between items-center">
          <h3 className="text-lg font-serif font-bold text-stone-800 truncate pr-4">
            {source?.title}
          </h3>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-8 h-8 border-4 border-terracotta-200 border-t-terracotta-600 rounded-full animate-spin"></div>
              <p className="text-stone-500 text-sm animate-pulse">Generazione sintesi in corso...</p>
            </div>
          ) : (
            <div className="prose prose-stone max-w-none">
              <h4 className="text-xs font-bold uppercase tracking-widest text-terracotta-700 mb-3">
                Sintesi Critica
              </h4>
              <p className="text-stone-700 leading-relaxed font-serif text-lg">
                {summary}
              </p>
              
              <div className="mt-8 pt-6 border-t border-stone-200">
                <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                  Citazione Suggerita
                </h4>
                <div className="bg-stone-100 p-3 rounded text-sm text-stone-600 font-mono italic select-all">
                  {source?.citation}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex justify-end">
           <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-stone-300 text-stone-600 text-sm rounded hover:bg-stone-50 transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;