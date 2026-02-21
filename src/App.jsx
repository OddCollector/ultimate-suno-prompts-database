// src/App.jsx
import React, { useEffect, useState } from 'react';
import CategoryAccordion from './components/CategoryAccordion';
import PromptModal from './components/PromptModal';
import TagAutocomplete from './components/TagAutocomplete';
import lunr from 'lunr';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [promptsIndex, setPromptsIndex] = useState({});
  const [query, setQuery] = useState('');
  const [activePrompt, setActivePrompt] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchIndex, setSearchIndex] = useState(null);
  const [docsMap, setDocsMap] = useState({});

  useEffect(() => {
    fetch('/data/categories.json')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    categories.forEach(cat => {
      if (!promptsIndex[cat.id]) {
        fetch(`/data/prompts/${cat.id}.json`)
          .then(r => r.json())
          .then(prompts => setPromptsIndex(prev => ({ ...prev, [cat.id]: prompts })))
          .catch(() => {});
      }
    });
  }, [categories]);

  useEffect(() => {
    Promise.all([
      fetch('/search/index.json').then(r => r.json()).catch(() => null),
      fetch('/search/docs.json').then(r => r.json()).catch(() => ({}))
    ]).then(([idxJson, docs]) => {
      if (idxJson) {
        try {
          const idx = lunr.Index.load(idxJson);
          setSearchIndex(idx);
          setDocsMap(docs || {});
        } catch (e) {
          console.error('Failed to load Lunr index', e);
        }
      }
    });
  }, []);

  function runSearch() {
    if (!searchIndex) return null;
    const q = query.trim();
    if (!q && selectedTags.length === 0) return null;

    let results = [];
    if (q) {
      try {
        results = searchIndex.search(q);
      } catch (e) {
        results = Object.keys(docsMap).map(id => ({ ref: id }));
      }
    } else {
      results = Object.keys(docsMap).map(id => ({ ref: id }));
    }

    const mapped = results.map(r => docsMap[r.ref]).filter(Boolean);
    if (selectedTags.length > 0) {
      return mapped.filter(d => selectedTags.every(t => (d.tags || []).includes(t)));
    }
    return mapped;
  }

  const searchResults = runSearch();

  function matchesFilter(p) {
    if (query || selectedTags.length > 0) {
      return (searchResults || []).some(r => r.id === p.id);
    }
    return true;
  }

  return (
    <div className="app" style={{padding:20,fontFamily:'Inter,system-ui,Arial'}}>
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h1 style={{margin:0}}>Suno Prompt Database</h1>
        <div className="controls" style={{display:'flex',gap:12,alignItems:'center'}}>
          <input
            placeholder="Search title, prompt, tags"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{padding:8,borderRadius:6,border:'1px solid #e5e7eb',minWidth:260}}
          />
          <div style={{minWidth:320}}>
            <TagAutocomplete value={selectedTags} onChange={setSelectedTags} />
          </div>
        </div>
      </header>

      <main>
        {categories.map(cat => (
          <CategoryAccordion
            key={cat.id}
            category={cat}
            prompts={(promptsIndex[cat.id] || []).filter(matchesFilter)}
            onOpenPrompt={p => setActivePrompt(p)}
          />
        ))}
      </main>

      {activePrompt && <PromptModal prompt={activePrompt} onClose={() => setActivePrompt(null)} />}
    </div>
  );
}
