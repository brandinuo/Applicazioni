import React from 'react';
import { SourceType } from '../types';

interface SearchFiltersProps {
  selected: SourceType;
  onSelect: (type: SourceType) => void;
  disabled: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ selected, onSelect, disabled }) => {
  const types = Object.values(SourceType);

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {types.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          disabled={disabled}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
            ${selected === type 
              ? 'bg-terracotta-700 text-white border-terracotta-700 shadow-md' 
              : 'bg-stone-50 text-stone-600 border-stone-300 hover:border-terracotta-400 hover:text-terracotta-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {type}
        </button>
      ))}
    </div>
  );
};

export default SearchFilters;