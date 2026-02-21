// src/components/PromptModal.jsx
import React from 'react';

export default function PromptModal({ prompt, onClose }) {
  function copyPrompt() {
    navigator.clipboard.writeText(prompt.prompt || '').then(() => {});
  }

  const editUrl = `https://github.com/OddCollector/ultimate-suno-prompts-database/edit/main/data/prompts/${prompt.category ? prompt.category.toLowerCase() : 'misc'}.json`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 style={{margin:0}}>{prompt.title}</h2>
          <button onClick={onClose} aria-label="Close">Close</button>
        </header>

        <section className="modal-body">
          <p><strong>Category</strong> {prompt.category}</p>
          <p><strong>Tags</strong> {(prompt.tags || []).join(', ')}</p>
          <pre className="full-prompt">{prompt.prompt}</pre>

          {prompt.json_prompts && (
            <>
              <h4>JSON Prompts</h4>
              <pre className="json">{JSON.stringify(prompt.json_prompts, null, 2)}</pre>
            </>
          )}

          {prompt.lyrics && (
            <>
              <h4>Lyrics</h4>
              <pre className="lyrics">{prompt.lyrics}</pre>
            </>
          )}
        </section>

        <footer style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
          <div>
            <button onClick={copyPrompt}>Copy Prompt</button>
            <a className="edit-pr" href={editUrl} target="_blank" rel="noreferrer" style={{marginLeft:12}}>Edit on GitHub</a>
          </div>
          <div>
            <a href={prompt.artwork?.cover || '#'} target="_blank" rel="noreferrer">Artwork</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
