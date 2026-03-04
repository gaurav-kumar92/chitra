
'use client';

import React, { useState, useMemo } from 'react';
import { allSymbols } from '@/lib/all-symbols';
import { Input } from '@/components/ui/input';
import { useCanvas } from '@/contexts/CanvasContext';

type AddItemDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectItem: (itemType: string, symbol?: string) => void;
};

const AddItemDialog: React.FC<AddItemDialogProps> = ({ isOpen, onClose, onSelectItem }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { handleAddSymbol } = useCanvas();

    const filteredSymbols = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const lowerCaseQuery = searchQuery.toLowerCase();
        
        return allSymbols.filter(symbol => 
            symbol.name.toLowerCase().includes(lowerCaseQuery)
        );
    }, [searchQuery]);

    if (!isOpen) {
        return null;
    }

    const handleSymbolClick = (symbol: string) => {
        handleAddSymbol(symbol);
        onClose();
    };

    const handleCategoryClick = (itemType: string) => {
        onSelectItem(itemType);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh', width: '90vw', maxWidth: '600px' }}>
                <h3 className="text-lg font-semibold mb-4 flex-shrink-0">What would you like to add?</h3>
                
                <div className="mb-4 flex-shrink-0">
                    <Input 
                        type="text"
                        placeholder="Search for symbols (e.g., 'heart', 'arrow', 'sun')..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="overflow-y-auto pr-2 flex-grow">
                    {searchQuery.trim() ? (
                        <div id="symbol-search-results" className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {filteredSymbols.map((symbol, index) => (
                                <button 
                                    key={`${symbol.char}-${index}`} 
                                    className="add-item-card p-2" 
                                    title={symbol.name}
                                    onClick={() => handleSymbolClick(symbol.char)}
                                >
                                    <span className="text-3xl">{symbol.char}</span>
                                </button>
                            ))}
                             {filteredSymbols.length === 0 && (
                                <p className="col-span-full text-center text-gray-500 py-4">No symbols found.</p>
                            )}
                        </div>
                    ) : (
                        <div id="add-item-options" className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <button className="add-item-card" data-item-type="text" onClick={() => handleCategoryClick('text')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                                <span>Text</span>
                            </button>
                            <button className="add-item-card" data-item-type="shape" onClick={() => handleCategoryClick('shape')}>
                                <svg className="w-10 h-10 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                                <span>Shape</span>
                            </button>
                            <button className="add-item-card" data-item-type="image" onClick={() => handleCategoryClick('image')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                <span>Image</span>
                            </button>
                            <button className="add-item-card" data-item-type="frame" onClick={() => handleCategoryClick('frame')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                                <span>Frame</span>
                            </button>
                            <button className="add-item-card" data-item-type="mask" onClick={() => handleCategoryClick('mask')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM4.5 12a7.5 7.5 0 0 0 7.5 7.5v-15A7.5 7.5 0 0 0 4.5 12z"/></svg>
                                <span>Mask</span>
                            </button>
                            <button className="add-item-card" data-item-type="clipart" onClick={() => handleCategoryClick('clipart')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                                <span>Clipart</span>
                            </button>
                            <button className="add-item-card" data-item-type="emoji" onClick={() => handleCategoryClick('emoji')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                                <span>Emoji</span>
                            </button>
                            <button className="add-item-card" data-item-type="icon" onClick={() => handleCategoryClick('icon')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2"><path d="M12 2.5c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12.5 6.477 2.5 12 2.5z"/><path d="M12 17.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/><path d="M12 7.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/></svg>
                                <span>Icon</span>
                            </button>
                            <button className="add-item-card" data-item-type="qr" disabled>
                                <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h.01"/><path d="M21 12h.01"/><path d="M12 21h-1a2 2 0 0 1-2-2v-1"/></svg>
                                <span>QR Code</span>
                            </button>
                        </div>
                    )}
                </div>
                <div className="dialog-actions mt-6 flex-shrink-0">
                    <button id="cancel-add-item-btn" className="dialog-button dialog-button-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default AddItemDialog;

    