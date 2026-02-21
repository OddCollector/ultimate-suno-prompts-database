// src/components/TagAutocomplete.jsx
import React, { useEffect, useState } from 'react';

export default function TagAutocomplete({ value = [], onChange }) {
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetch('/data/tags.json')
      .then(r => r.json())
      .then(setTags)
      .catch(() => setTags([]));
  }, []);

  useEffect(() => {
    const q = input.trim().toLowerCase();
    if (!q) return setSuggestions([]);
    const s = tags.filter(t => t.toLowerCase().includes(q) && !value.includes(t)).slice(0, 8);
    setSuggestions(s);
  }, [input, tags, value]);

  function addTag(t) {
    const next = [...value, t];
    onChange(next);
    setInput('');
    setSuggestions([]);
  }

  function removeTag(t) {
    onChange(value.filter(x => x !== t));
  }

  return (
    <div className="tag-autocomplete">
      <div className="selected" style={{display:'flex',flexWrap:'wrap',gap:6,alignItems:'center'}}>
        {value.map(t => (
          <span key={t} className="tag-pill" style={{background:'#eef2ff',padding:'4px 8px',borderRadius:999,display:'inline-flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:13}}>{t}</span>
            <button onClick={() => removeTag(t)} aria-label={`Remove ${t}`} style={{border:0,background:'transparent',cursor:'pointer'}}>×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type to search tags"
          aria-label="Tag search"
          style={{border:0,outline:'none',minWidth:120}}
        />
      </div>

      {suggestions.length > 0 && (
        <ul className="suggestions" style={{listStyle:'none',margin:6,padding:8,background:'#fff',border:'1px solid #e5e7eb',borderRadius:6,maxWidth:360}}>
          {suggestions.map(s => (
            <li key={s} onClick={() => addTag(s)} style={{padding:'6px 8px',cursor:'pointer'}}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
