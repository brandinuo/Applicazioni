import React from 'react';
import { SourceItem } from '../types';

interface SourceCardProps {
  source: SourceItem;
  onSynthesize: (source: SourceItem) => void;
}

const SourceCard: React.FC<SourceCardProps> = ({ source, onSynthesize }) => {
  return (
    <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full relative overflow-hidden group">
      {/* Decorative colored line top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-terracotta-200 group-hover:bg-terracotta-500 transition-colors duration-300"></div>
      
      <div className="flex justify-between items-start mb-2 mt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-terracotta-700 bg-terracotta-50 px-2 py-1 rounded-sm">
          {source.type}
        </span>
        {source.year && (
          <span className="text-xs text-stone-400 font-serif italic">
            {source.year}
          </span>
        )}
      </div>

      <h3 className="text-xl font-serif font-semibold text-stone-800 mb-1 leading-tight">
        {source.title}
      </h3>
      
      <p className="text-sm text-stone-500 mb-4 font-medium">
        {source.author}
      </p>

      <p className="text-stone-600 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">
        {source.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-auto">
        {source.url ? (
          <a 
            href={source.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-stone-400 hover:text-terracotta-600 underline decoration-stone-300 hover:decoration-terracotta-600 transition-all"
          >
            Fonte Originale
          </a>
        ) : (
          <span className="text-xs text-stone-300 cursor-not-allowed">Link non disponibile</span>
        )}

        <button
          onClick={() => onSynthesize(source)}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-terracotta-700 hover:text-terracotta-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
          Sintesi
        </button>
      </div>
    </div>
  );
};

export default SourceCard;