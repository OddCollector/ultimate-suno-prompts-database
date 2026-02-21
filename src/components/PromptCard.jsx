// src/components/PromptCard.jsx
import React from 'react';

export default function PromptCard({ prompt, onOpen }) {
  return (
    <article className="card" onClick={onOpen} role="button" tabIndex={0}>
      <h3>{prompt.title}</h3>
      <div className="meta">
        <span className="category">{prompt.category}</span>
        <span className="tags">{(prompt.tags || []).join(', ')}</span>
      </div>
      <pre className="preview">{prompt.prompt?.slice(0, 140)}{prompt.prompt?.length > 140 ? '…' : ''}</pre>
    </article>
  );
}
