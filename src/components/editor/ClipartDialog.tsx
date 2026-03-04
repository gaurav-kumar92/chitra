
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

type ClipartDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddClipart: (clipart: { parts: { [key: string]: string }, defaultColors: { [key: string]: string } }) => void;
};

const cliparts = [
    {
        name: 'Smiley Face',
        viewBox: '0 0 200 200',
        parts: {
            face: 'M100 20C44.77 20 0 64.77 0 120s44.77 100 100 100 100-44.77 100-100S155.23 20 100 20z',
            leftEye: 'M65 80c8.28 0 15 6.72 15 15s-6.72 15-15 15-15-6.72-15-15 6.72-15 15-15z',
            rightEye: 'M135 80c8.28 0 15 6.72 15 15s-6.72 15-15 15-15-6.72-15-15 6.72-15 15-15z',
            mouth: 'M50 140c0 27.61 22.39 50 50 50s50-22.39 50-50H50z'
        },
        defaultColors: {
            face: '#3b82f6',
            leftEye: 'black',
            rightEye: 'black',
            mouth: 'black'
        }
    },
    {
        name: 'Heart',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12 21.23l-1.41-1.41C5.61 15.03 2 11.55 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 4.05-3.61 7.53-8.59 12.32L12 21.23z'
        },
        defaultColors: {
            shape: '#ef4444'
        }
    },
    {
        name: 'Star',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
        },
        defaultColors: {
            shape: '#facc15'
        }
    },
    {
        name: 'Cloud',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'
        },
        defaultColors: {
            shape: '#60a5fa'
        }
    },
    {
        name: 'Sun',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 12h3m14 0h3M12 2v3m0 14v3m-8.36-8.36L4.22 4.22m15.56 15.56l-2.42-2.42m0-11.14l2.42-2.42m-15.56 0l2.42 2.42'
        },
        defaultColors: {
            shape: '#fbbf24'
        }
    },
    {
        name: 'Moon',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M21.64 13.5A8.96 8.96 0 0 1 11.5 3.36 8.96 8.96 0 0 0 2.5 12.36a8.96 8.96 0 0 0 9.64 9.14 9.32 9.32 0 0 0 .14-1.89A8.96 8.96 0 0 1 21.64 13.5z'
        },
        defaultColors: {
            shape: '#f3f4f6'
        }
    },
    {
        name: 'Lightning Bolt',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M7 2v11h3v9l7-12h-4l4-8z'
        },
        defaultColors: {
            shape: '#fde047'
        }
    },
    {
        name: 'Water Drop',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z'
        },
        defaultColors: {
            shape: '#38bdf8'
        }
    },
    {
        name: 'Speech Bubble',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'
        },
        defaultColors: {
            shape: '#e5e7eb'
        }
    },
    {
        name: 'Checkmark',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z'
        },
        defaultColors: {
            shape: '#4ade80'
        }
    },
    {
        name: 'Cross Mark',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'
        },
        defaultColors: {
            shape: '#f87171'
        }
    },
    {
        name: 'Right Arrow',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z'
        },
        defaultColors: {
            shape: '#9ca3af'
        }
    },
    {
        name: 'Diamond',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12 2L2 12l10 10 10-10L12 2z'
        },
        defaultColors: {
            shape: '#a78bfa'
        }
    },
    {
        name: 'Music Note',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'
        },
        defaultColors: {
            shape: '#f472b6'
        }
    },
    {
        name: 'Bell',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'
        },
        defaultColors: {
            shape: '#f59e0b'
        }
    },
    {
        name: 'Flag',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z'
        },
        defaultColors: {
            shape: '#ef4444'
        }
    },
    {
        name: 'House',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12 3L2 12h3v8h14v-8h3L12 3zm5 15h-4v-4h-2v4H6v-6.3l6-4.5 6 4.5V18z'
        },
        defaultColors: {
            shape: '#84cc16'
        }
    },
    {
        name: 'Tree',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12 2L2 12h3v8h14v-8h3L12 2zm0 2.83L17.17 10H6.83L12 4.83zM6 12h12v6H6v-6z'
        },
        defaultColors: {
            shape: '#16a34a'
        }
    },
    {
        name: 'Shopping Cart',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM17 18c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.17 14.75L7.2 14.63l.15-.28L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A.996.996 0 0 0 20.01 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.24 17 6.5 17H20v-2H7.43c-.13 0-.25-.11-.26-.25z'
        },
        defaultColors: {
            shape: '#14b8a6'
        }
    },
    {
        name: 'Rocket',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z'
        },
        defaultColors: {
            shape: '#d946ef'
        }
    },
    {
        name: 'Lightbulb',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z'
        },
        defaultColors: {
            shape: '#eab308'
        }
    },
    {
        name: 'Gear',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z'
        },
        defaultColors: {
            shape: '#78716c'
        }
    },
    {
        name: 'Lock',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'
        },
        defaultColors: {
            shape: '#a1a1aa'
        }
    },
    {
        name: 'Key',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z'
        },
        defaultColors: {
            shape: '#facc15'
        }
    },
    {
        name: 'Gift',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35-.54-.81-1.45-1.35-2.5-1.35-1.66 0-3 1.34-3 3 0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-8 13H4V8h8v11zm-2-5h-2v2h2v-2zm-2-4h2v2h-2V9zm4 9h8V8h-8v11zm2-5h2v2h-2v-2zm2-4h-2v2h2V9zM12 4.5c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5z'
        },
        defaultColors: {
            shape: '#c084fc'
        }
    },
    {
        name: 'Trophy',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M20.5 2H19V1c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v1H9V1c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v1H1.5C.67 2 0 2.67 0 3.5v5c0 2.76 2.24 5 5 5v2c0 1.66 1.34 3 3 3h4c1.66 0 3-1.34 3-3v-2c2.76 0 5-2.24 5-5v-5c0-.83-.67-1.5-1.5-1.5zM12 18H8v-2h4v2zm5-10.5c0 1.38-1.12 2.5-2.5 2.5S12 8.88 12 7.5 10.88 5 9.5 5s-2.5 1.12-2.5 2.5H4.5V4h3v1c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V4h3v3.5h-2.5z'
        },
        defaultColors: {
            shape: '#fb923c'
        }
    },
    {
        name: 'Camera',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M9.4 10.5L12 14.82 14.6 10.5h-5.2zM21 4h-3.17L16 2H8L6.17 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'
        },
        defaultColors: {
            shape: '#71717a'
        }
    }
];

const ClipartDialog: React.FC<ClipartDialogProps> = ({ isOpen, onClose, onAddClipart }) => {
    if (!isOpen) {
        return null;
    }

    const handleClipartSelect = (clipart: (typeof cliparts)[0]) => {
        onAddClipart({ parts: clipart.parts, defaultColors: clipart.defaultColors });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh', maxWidth: '500px' }}>
                <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Select Clipart</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 overflow-y-auto pr-4 flex-grow">
                    {cliparts.map((clipart, index) => (
                        <button
                            key={index}
                            className="shape-btn p-4 flex items-center justify-center"
                            title={clipart.name}
                            onClick={() => handleClipartSelect(clipart)}
                        >
                           <svg viewBox={clipart.viewBox} width="50" height="50">
                                {Object.entries(clipart.parts).map(([partName, pathData]) => {
                                    const fill = clipart.defaultColors?.[partName as keyof typeof clipart.defaultColors] || 'black';
                                    return <path key={partName} d={pathData} fill={fill} />;
                                })}
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

export default ClipartDialog;
