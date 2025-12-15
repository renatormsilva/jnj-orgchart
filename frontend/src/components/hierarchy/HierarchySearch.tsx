import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, User, Briefcase, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HierarchyNode } from '../../types/person';
import { searchHierarchy, SearchResult } from '../../utils/search';
import { getPersonPhotoUrl } from '../../utils/avatar';

interface HierarchySearchProps {
  hierarchyData: HierarchyNode;
  onSelectPerson: (personId: string) => void;
  onSearchChange: (term: string) => void;
}

export const HierarchySearch: React.FC<HierarchySearchProps> = ({
  hierarchyData,
  onSelectPerson,
  onSearchChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];
    return searchHierarchy(hierarchyData, searchTerm).slice(0, 8);
  }, [hierarchyData, searchTerm]);

  useEffect(() => {
    onSearchChange(searchTerm);
  }, [searchTerm, onSearchChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchResults]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleSelectResult(searchResults[selectedIndex]);
        } else if (searchResults.length > 0) {
          handleSelectResult(searchResults[0]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    onSelectPerson(result.id);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearchChange('');
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, isMatched: boolean) => {
    if (!isMatched || !searchTerm.trim()) return text;

    const searchWords = searchTerm.toLowerCase().split(/\s+/);
    let result = text;

    searchWords.forEach(word => {
      if (word.length < 2) return;
      const regex = new RegExp(`(${word})`, 'gi');
      result = result.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 rounded px-0.5">$1</mark>');
    });

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <div className="relative flex-1 max-w-lg">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by name, title, or department..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-11 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jnj-red focus:border-jnj-red transition-all bg-white text-gray-900 placeholder-gray-500"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && searchResults.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="p-2 border-b border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 font-medium">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {searchResults.map((result, index) => (
                <motion.button
                  key={result.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSelectResult(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full flex items-center gap-3 p-3 text-left transition-all
                    ${selectedIndex === index ? 'bg-jnj-red/10' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={getPersonPhotoUrl(result.photoPath, result.id, result.name)}
                      alt={result.name}
                      className="w-12 h-12 rounded-lg object-cover ring-2 ring-gray-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(result.id)}&backgroundColor=f0f0f0`;
                      }}
                    />
                    {selectedIndex === index && (
                      <motion.div
                        layoutId="selected-indicator"
                        className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-jnj-red rounded-full"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <p className="font-semibold text-gray-900 truncate">
                        {highlightMatch(result.name, result.matchedFields.includes('name'))}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-600 truncate">
                        {highlightMatch(result.jobTitle, result.matchedFields.includes('jobTitle'))}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <p className="text-xs text-gray-500 truncate">
                        {highlightMatch(result.department, result.matchedFields.includes('department'))}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                      Enter ↵
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="p-2 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 text-center">
                Use ↑↓ to navigate • Enter to select • Esc to close
              </p>
            </div>
          </motion.div>
        )}

        {isOpen && searchTerm.length >= 2 && searchResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center"
          >
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">No results found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try searching with different keywords
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
