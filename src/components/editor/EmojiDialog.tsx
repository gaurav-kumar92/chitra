
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { emojiCategories } from '@/lib/emoji-symbols';
import { ScrollArea } from '../ui/scroll-area';

type EmojiDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddEmoji: (emoji: string) => void;
};

const EmojiDialog: React.FC<EmojiDialogProps> = ({ isOpen, onClose, onAddEmoji }) => {
    if (!isOpen) {
        return null;
    }

    const handleEmojiSelect = (emoji: string) => {
        onAddEmoji(emoji);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ height: '85vh', maxHeight: '700px', width: '90vw', maxWidth: '700px' }}>
                <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Select an Emoji</h3>
                
                <Tabs defaultValue={emojiCategories[0].name} className="flex flex-col flex-grow w-full overflow-hidden">
                    <TabsList className="flex-shrink-0 w-full justify-start overflow-x-auto">
                        {emojiCategories.map((category) => (
                            <TabsTrigger key={category.name} value={category.name} className="text-2xl px-3">
                                {category.icon}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {emojiCategories.map((category) => (
                        <TabsContent key={category.name} value={category.name} className="flex-grow mt-4 overflow-hidden" style={{ height: 'calc(100% - 80px)'}}>
                             <ScrollArea className="h-full">
                                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 pr-4">
                                    {category.symbols.map((symbol) => (
                                        <button
                                            key={symbol.char}
                                            className="add-item-card p-2 text-3xl"
                                            title={symbol.name}
                                            onClick={() => handleEmojiSelect(symbol.char)}
                                        >
                                            {symbol.char}
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    ))}
                </Tabs>

                <div className="dialog-actions flex justify-end gap-2 mt-4 flex-shrink-0">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EmojiDialog;
