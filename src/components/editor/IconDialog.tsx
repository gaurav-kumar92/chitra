
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { materialIcons } from '@/lib/icons';

type IconDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddIcon: (icon: { path: string }) => void;
};


const IconDialog: React.FC<IconDialogProps> = ({ isOpen, onClose, onAddIcon }) => {
    if (!isOpen) {
        return null;
    }

    const handleIconSelect = (iconPath: string) => {
        onAddIcon({ path: iconPath });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh', maxWidth: '600px' }}>
                <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Select an Icon</h3>
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-4 overflow-y-auto pr-4 flex-grow">
                    {materialIcons.map((icon, index) => (
                        <button
                            key={index}
                            className="shape-btn p-4 flex items-center justify-center"
                            title={icon.name}
                            onClick={() => handleIconSelect(icon.path)}
                        >
                           <svg viewBox="0 0 24 24" width="32" height="32">
                                <path d={icon.path} fill="currentColor" />
                           </svg>
                        </button>
                    ))}
                </div>
                <div className="dialog-actions flex justify-end gap-2 mt-4 flex-shrink-0">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default IconDialog;
