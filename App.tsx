import React, { useState, useCallback } from 'react';
import { SourceType, SourceItem, ResearchResult } from './types';
import SearchFilters from './components/SearchFilters';
import SourceCard from './components/SourceCard';
import SummaryModal from './components/SummaryModal';
import { searchHumanitiesSources, synthesizeSource } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SourceType>(SourceType.ALL);
  const [items, setItems] = useState<SourceItem[]>([]);
  const [groundingLinks, setGroundingLinks] = useState<{title: string, url: string}[]>([]);
  
  // UI State
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);
  const [summaryText, setSummaryText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Handlers
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);
    setItems([]);
    setGroundingLinks([]);

    try {
      const result: ResearchResult = await searchHumanitiesSources(query, searchType);
      setItems(result.items);
      setGroundingLinks(result.groundingLinks);
      
      if (result.items.length === 0) {
        setError("Nessuna fonte trovata. Prova a riformulare la ricerca.");
      }
    } catch (err: any) {
      setError(err.message || "Si è verificato un errore imprevisto.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSynthesize = useCallback(async (source: SourceItem) => {
    setSelectedSource(source);
    setIsModalOpen(true);
    setSummaryText('');
    setIsSynthesizing(true);

    try {
      const text = await synthesizeSource(source, query);
      setSummaryText(text);
    } catch (err) {
      setSummaryText("Errore durante la generazione della sintesi.");
    } finally {
      setIsSynthesizing(false);
    }
  }, [query]);

  const closeModal = () => {
    setIsModalOpen(false);
    // Slight delay to clear state after animation would play (if we had one)
    setTimeout(() => {
      setSelectedSource(null);
      setSummaryText('');
    }, 200);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-terracotta-200 selection:text-terracotta-900">
      
      {/* Header / Hero */}
      <header className={`transition-all duration-500 ease-in-out ${hasSearched ? 'pt-8 pb-6' : 'pt-32 pb-12'} px-4`}>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className={`font-serif font-bold text-stone-900 transition-all duration-500 ${hasSearched ? 'text-3xl mb-4' : 'text-5xl mb-6'}`}>
            Umanistica
          </h1>
          <p className={`text-stone-500 font-serif italic mb-8 transition-opacity duration-500 ${hasSearched ? 'opacity-0 h-0 overflow-hidden m-0' : 'opacity-100 text-xl'}`}>
            Il tuo compagno di ricerca per studi letterari, storici e filosofici.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca un argomento, autore o periodo storico..."
              className="w-full px-6 py-4 text-lg bg-white border border-stone-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent placeholder:text-stone-300 transition-shadow"
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="absolute right-2 top-2 h-10 w-10 bg-terracotta-600 text-white rounded-full flex items-center justify-center hover:bg-terracotta-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              )}
            </button>
          </form>

          <SearchFilters 
            selected={searchType} 
            onSelect={setSearchType} 
            disabled={isSearching}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        
        {/* Error Message */}
        {error && (
          <div className="max-w-xl mx-auto mt-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* Results Grid */}
        {items.length > 0 && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-2">
              <h2 className="text-xl font-serif font-semibold text-stone-700">
                Risultati della ricerca
              </h2>
              <span className="text-xs text-stone-400 uppercase tracking-widest">
                {items.length} Fonti Trovate
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <SourceCard 
                  key={item.id} 
                  source={item} 
                  onSynthesize={handleSynthesize} 
                />
              ))}
            </div>

            {/* Grounding Sources Links (Footer style for credibility) */}
            {groundingLinks.length > 0 && (
              <div className="mt-16 pt-8 border-t border-stone-200">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4">
                  Fonti Web Consultate
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {groundingLinks.map((link, idx) => (
                    <li key={idx}>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-stone-500 hover:text-terracotta-600 truncate block transition-colors"
                      >
                        • {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Empty State / Initial Placeholder */}
        {!hasSearched && !isSearching && (
          <div className="text-center mt-12 opacity-60">
            <div className="inline-block p-6 rounded-full bg-stone-100 mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-stone-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <p className="text-stone-400 font-serif">Inizia la tua indagine bibliografica.</p>
          </div>
        )}
      </main>

      {/* Summary Modal */}
      <SummaryModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        source={selectedSource}
        summary={summaryText}
        isLoading={isSynthesizing}
      />
    </div>
  );
};

export default App;