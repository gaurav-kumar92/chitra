
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Plus,
  MousePointer2,
  Settings,
  Layers,
  Save,
  CheckCircle2,
} from 'lucide-react';

const steps = [
  {
    title: "Welcome to Chitra!",
    description: "Unleash your creativity with our professional design suite. Let's take a 30-second tour to master the basics.",
    icon: <Sparkles className="w-12 h-12 text-primary animate-pulse" />,
  },
  {
    title: "Add Elements",
    description: "Click the '+' icon to bring your vision to life. Choose from thousands of symbols, emojis, or upload your own images.",
    icon: <Plus className="w-12 h-12 text-primary" />,
  },
  {
    title: "The Canvas",
    description: "Your digital playground. Drag to move, pinch to zoom, and double-click any object to enter advanced editing modes.",
    icon: <MousePointer2 className="w-12 h-12 text-primary" />,
  },
  {
    title: "Smart Customization",
    description: "Every element is fully adjustable. Use the bottom properties bar to change colors, add gradients, or apply cinematic animations.",
    icon: <Settings className="w-12 h-12 text-primary" />,
  },
  {
    title: "Precision Layers",
    description: "Organize complex designs with ease. Lock items to prevent accidental edits and reorder layers to create depth.",
    icon: <Layers className="w-12 h-12 text-primary" />,
  },
  {
    title: "Share Your Creation",
    description: "Export your work in high resolution. Download as PNG for web, PDF for print, or even an animated GIF!",
    icon: <Save className="w-12 h-12 text-primary" />,
  },
  {
    title: "Ready to Create?",
    description: "The editor is now yours. Explore the tools and build something beautiful. We can't wait to see what you make!",
    icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
  }
];

const Walkthrough = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Updated key to v2 to force the walkthrough to show again after improvements
    const hasSeenTour = localStorage.getItem('chitra-tour-v2');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('chitra-tour-v2', 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] text-center border-none shadow-2xl">
        <div className="flex justify-center mb-6 mt-4">
          {step.icon}
        </div>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">{step.title}</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground leading-relaxed pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center gap-1.5 mt-6">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-10 bg-primary' : 'w-2 bg-muted'}`}
            />
          ))}
        </div>

        <DialogFooter className="flex flex-row justify-between items-center mt-8 w-full gap-4">
          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
            Skip
          </Button>
          <Button onClick={handleNext} className="px-8">
            {currentStep === steps.length - 1 ? "Get Started" : "Next Step"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Walkthrough;
