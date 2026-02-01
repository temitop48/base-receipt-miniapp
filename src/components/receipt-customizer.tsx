'use client';

import { useState } from 'react';
import type { ReceiptTag } from '@/types/receipt';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface ReceiptCustomizerProps {
  onSave: (note: string, tag: ReceiptTag) => void;
}

const TAGS: ReceiptTag[] = ['First time', 'Milestone', 'Win', 'Loss', 'Chaos'];

export function ReceiptCustomizer({ onSave }: ReceiptCustomizerProps) {
  const [note, setNote] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<ReceiptTag>('Milestone');

  const handleSave = () => {
    onSave(note, selectedTag);
  };

  const tagColors: Record<string, string> = {
    'First time': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700',
    'Milestone': 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 border-blue-300 dark:border-blue-700',
    'Win': 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50 border-amber-300 dark:border-amber-700',
    'Loss': 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50 border-rose-300 dark:border-rose-700',
    'Chaos': 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 border-purple-300 dark:border-purple-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="note" className="text-sm font-bold mb-3 block">
          Add a note (max 140 characters)
        </Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (e.target.value.length <= 140) {
              setNote(e.target.value);
            }
          }}
          placeholder="What made this transaction special?"
          className="min-h-32 resize-none rounded-xl border-2 focus:ring-2 focus:ring-primary transition-all"
          maxLength={140}
        />
        <p className="text-xs text-muted-foreground mt-2 text-right font-medium">
          {note.length}/140 characters
        </p>
      </div>

      <div>
        <Label className="text-sm font-bold mb-3 block">
          Choose a tag
        </Label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag: ReceiptTag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border-2 ${
                selectedTag === tag
                  ? `${tagColors[tag]} ring-4 ring-primary/20 scale-105`
                  : `${tagColors[tag]} opacity-50 hover:opacity-75`
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-base py-6 button-glow"
        size="lg"
      >
        Continue to Mint →
      </Button>
    </div>
  );
}
