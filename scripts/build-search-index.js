// scripts/build-search-index.js
const fs = require('fs');
const path = require('path');
const lunr = require('lunr');

const dataDir = path.join(__dirname, '..', 'data', 'prompts');
const outDir = path.join(__dirname, '..', 'public', 'search');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  entries.forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isFile() && e.name.endsWith('.json')) {
      files.push(full);
    } else if (e.isDirectory()) {
      const nested = fs.readdirSync(full).filter(n => n.endsWith('.json')).map(n => path.join(full, n));
      files.push(...nested);
    }
  });

  return files;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error('Failed to parse JSON', file, err);
    return null;
  }
}

function flattenDocs(files) {
  const docs = [];
  files.forEach(file => {
    const data = readJson(file);
    if (!data) return;
    if (Array.isArray(data)) {
      data.forEach(item => docs.push(item));
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.prompts)) data.prompts.forEach(p => docs.push(p));
      else if (data.id && data.prompt) docs.push(data);
      else {
        Object.values(data).forEach(v => {
          if (Array.isArray(v)) v.forEach(item => docs.push(item));
        });
      }
    }
  });
  return docs;
}

const files = collectFiles(dataDir);
const rawDocs = flattenDocs(files);

const docsMap = {};
const lunrDocs = rawDocs.map((d, i) => {
  const id = d.id || `doc-${i}`;
  const doc = {
    id,
    title: (d.title || '').toString(),
    prompt: (d.prompt || '').toString(),
    tags: (d.tags || []).join(' '),
    category: (d.category || '').toString()
  };
  docsMap[id] = {
    id,
    title: doc.title,
    prompt: doc.prompt,
    tags: d.tags || [],
    category: doc.category,
    file_name: d.file_name || null
  };
  return doc;
});

const idx = lunr(function () {
  this.ref('id');
  this.field('title', { boost: 10 });
  this.field('prompt');
  this.field('tags', { boost: 5 });
  this.field('category');

  lunrDocs.forEach(doc => {
    this.add(doc);
  });
});

fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(idx));
fs.writeFileSync(path.join(outDir, 'docs.json'), JSON.stringify(docsMap, null, 2));

console.log(`Built Lunr index with ${lunrDocs.length} documents -> ${outDir}`);
