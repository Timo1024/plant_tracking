import React, { useState, useRef, useEffect } from 'react';

interface AutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    suggestions: string[];
    placeholder?: string;
    className?: string;
    id?: string;
    name?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
    value,
    onChange,
    suggestions,
    placeholder = '',
    className = '',
    id,
    name,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter suggestions based on input
    useEffect(() => {
        if (value.trim() === '') {
            setFilteredSuggestions(suggestions);
        } else {
            const filtered = suggestions.filter(suggestion =>
                suggestion.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
        }
        setHighlightedIndex(-1);
    }, [value, suggestions]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        setIsOpen(true);
    };

    const handleSuggestionClick = (suggestion: string) => {
        onChange(suggestion);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown') {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
                    handleSuggestionClick(filteredSuggestions[highlightedIndex]);
                } else {
                    setIsOpen(false);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
            case 'Tab':
                setIsOpen(false);
                break;
        }
    };

    const handleFocus = () => {
        setIsOpen(true);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <input
                ref={inputRef}
                type="text"
                id={id}
                name={name}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${className}`}
                autoComplete="off"
            />

            {isOpen && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-green-500 rounded shadow-xl max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={`px-3 py-2 cursor-pointer transition-colors ${index === highlightedIndex
                                    ? 'bg-green-50 text-green-700'
                                    : 'hover:bg-green-50 hover:text-green-700'
                                }`}
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}

            {isOpen && filteredSuggestions.length === 0 && value.trim() !== '' && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded shadow-xl">
                    <div className="px-3 py-2 text-gray-500 italic">
                        No matches found. Press Enter to use "{value}"
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutocompleteInput;
