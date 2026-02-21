// src/components/CategoryAccordion.jsx
import React from 'react';
import PromptCard from './PromptCard';

export default function CategoryAccordion({ category, prompts, onOpenPrompt }) {
  return (
    <details className="category" open>
      <summary className="category-summary">
        <strong>{category.name}</strong>
        <span className="count">{prompts.length}</span>
      </summary>
      <div className="cards">
        {prompts.length === 0 && <div className="empty">No prompts</div>}
        {prompts.map(p => (
          <PromptCard key={p.id} prompt={p} onOpen={() => onOpenPrompt(p)} />
        ))}
      </div>
    </details>
  );
}
