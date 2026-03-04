
'use client';

import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Instagram, Linkedin, Facebook, Twitter, FileText, Monitor, Circle } from 'lucide-react';

type CanvasSizeSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

const canvasOptions = [
    {
        label: 'Social Media',
        options: [
            { value: '1080x1080', label: 'Instagram Post', icon: <Instagram /> },
            { value: '1080x1920', label: 'Instagram Story', icon: <Instagram /> },
            { value: '1200x630', label: 'Facebook Post', icon: <Facebook /> },
            { value: '851x315', label: 'Facebook Cover', icon: <Facebook /> },
            { value: '1600x900', label: 'Twitter Post', icon: <Twitter /> },
            { value: '1200x628', label: 'LinkedIn Post', icon: <Linkedin /> },
            { value: '1584x396', label: 'LinkedIn Banner', icon: <Linkedin /> },
        ]
    },
    {
        label: 'Documents',
        options: [
            { value: '816x1056', label: 'US Letter - Portrait', icon: <FileText /> },
            { value: '1056x816', label: 'US Letter - Landscape', icon: <FileText /> },
            { value: '842x1191', label: 'A4 - Portrait', icon: <FileText /> },
            { value: '1191x842', label: 'A4 - Landscape', icon: <FileText /> },
            { value: '595x842', label: 'A5 - Portrait', icon: <FileText /> },
            { value: '842x595', label: 'A5 - Landscape', icon: <FileText /> },
        ]
    },
    {
        label: 'Digital',
        options: [
            { value: '1920x1080', label: 'HD Screen (16:9)', icon: <Monitor /> },
            { value: '414x896', label: 'Phone Screen', icon: <Monitor /> },
            { value: '1024x1024', label: 'Square', icon: <Monitor /> },
            { value: '1024x1024-circle', label: 'Circle', icon: <Circle /> },
        ]
    }
];

const allOptions = canvasOptions.flatMap(group => group.options);

const getShortLabel = (label: string) => {
    if (label.includes('A4')) return 'A4';
    if (label.includes('A5')) return 'A5';
    if (label.includes('US Letter')) return 'Letter';
    return null;
}

const CanvasSizeSelector: React.FC<CanvasSizeSelectorProps> = ({ value, onChange }) => {
  const selectedOption = allOptions.find(opt => opt.value === value);

  let displayLabel = selectedOption?.label || '';
  const shortLabel = getShortLabel(displayLabel);
  const dimensions = value.split('-')[0].replace('x', ' x ');

  const triggerLabel = shortLabel || dimensions;
  
  const getItemLabel = (option: typeof allOptions[0]) => {
      const short = getShortLabel(option.label);
      const dims = option.value.split('-')[0].replace('x', ' x ');
      return short ? `${option.label} (${short})` : `${option.label} (${dims})`;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-auto h-8 px-2">
        <div className="flex items-center gap-2">
           {selectedOption?.icon}
           <span className="text-xs font-mono">{triggerLabel}</span>
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-[50vh]">
        {canvasOptions.map(group => (
            <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-3">
                            {option.icon}
                            <span>{getItemLabel(option)}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CanvasSizeSelector;
