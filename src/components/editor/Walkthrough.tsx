
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
    description: "Your creative journey starts here. Let's take a quick 1-minute tour to get you started with our powerful editor.",
    icon: <Sparkles className="w-12 h-12 text-primary animate-pulse" />,
  },
  {
    title: "1. Add New Items",
    description: "Look for the '+' button in the top toolbar. You can add Text, Shapes, Images, Icons, and even Emojis to your design.",
    icon: <Plus className="w-12 h-12 text-primary" />,
  },
  {
    title: "2. The Workspace",
    description: "This is your canvas. Drag objects to move them, or double-click any object to quickly swap an image or edit text.",
    icon: <MousePointer2 className="w-12 h-12 text-primary" />,
  },
  {
    title: "3. Customize Everything",
    description: "Select any item to see customization options at the bottom. Change colors, add gradients, adjust opacity, or even apply animations!",
    icon: <Settings className="w-12 h-12 text-primary" />,
  },
  {
    title: "4. Manage Layers",
    description: "The Layer panel lists all your objects. You can lock them to prevent accidental moves or reorder them to bring items to the front.",
    icon: <Layers className="w-12 h-12 text-primary" />,
  },
  {
    title: "5. Save Your Work",
    description: "Ready to show off? Use the Save icon to export your creation as a high-quality PNG, JPG, or an animated GIF!",
    icon: <Save className="w-12 h-12 text-primary" />,
  },
  {
    title: "You're All Set!",
    description: "Go ahead and create something amazing. If you get stuck, the editor is designed to be intuitive—just click and explore!",
    icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
  }
];

const Walkthrough = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if the user has already seen the walkthrough
    const hasSeenTour = localStorage.getItem('chitra-tour-completed');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
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
    localStorage.setItem('chitra-tour-completed', 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] text-center">
        <div className="flex justify-center mb-4">
          {step.icon}
        </div>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{step.title}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center gap-1 mt-4">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-primary' : 'w-2 bg-muted'}`}
            />
          ))}
        </div>

        <DialogFooter className="flex flex-row justify-between items-center mt-6 w-full">
          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
            Skip Tour
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Start Creating" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Walkthrough;
