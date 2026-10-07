import { Fragment } from 'react';
import CodeBlock from './CodeBlock.jsx';

// A tiny Markdown-like renderer for topic text. Supports:
//   blank-line separated paragraphs, "- " bullets, "1. " numbered lists,
//   "#### " small headings, **bold**, `inline code` and ```lang fenced code```.

// *italic* only when the stars hug a word, so "a * b" or "2*3" stay as they are.
const ITALIC = /(?<![\w*])\*(?![\s*])([^*\n]+?)(?<![\s*])\*(?![\w*])/g;

function renderItalics(text, keyPrefix) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(ITALIC)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<em key={`${keyPrefix}-${m.index}`}>{m[1]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderInline(text) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('`') && p.endsWith('`') && p.length > 1) {
      return <code key={i} className="inline-code">{p.slice(1, -1)}</code>;
    }
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) {
      return <strong key={i}>{renderItalics(p.slice(2, -2), i)}</strong>;
    }
    return <Fragment key={i}>{renderItalics(p, i)}</Fragment>;
  });
}

const BULLET = /^\s*[-*•] +/;
const NUMBER = /^\s*\d+[.)] +/;
const HEADING = /^#{1,6} +/;
const FENCE = /^\s*```/;

function parseBlocks(text) {
  const lines = String(text).replace(/\r/g, '').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (FENCE.test(line)) {
      const lang = line.trim().slice(3).trim() || 'javascript';
      const body = [];
      i++;
      while (i < lines.length && !FENCE.test(lines[i])) body.push(lines[i++]);
      i++; // closing fence
      blocks.push({ type: 'code', lang, code: body.join('\n') });
    } else if (BULLET.test(line)) {
      const items = [];
      while (i < lines.length && BULLET.test(lines[i])) items.push(lines[i++].replace(BULLET, ''));
      blocks.push({ type: 'ul', items });
    } else if (NUMBER.test(line)) {
      const items = [];
      while (i < lines.length && NUMBER.test(lines[i])) items.push(lines[i++].replace(NUMBER, ''));
      blocks.push({ type: 'ol', items });
    } else if (HEADING.test(line)) {
      blocks.push({ type: 'h', text: line.replace(HEADING, '') });
      i++;
    } else if (!line.trim()) {
      i++;
    } else {
      const para = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !BULLET.test(lines[i]) &&
        !NUMBER.test(lines[i]) &&
        !HEADING.test(lines[i]) &&
        !FENCE.test(lines[i])
      ) {
        para.push(lines[i++].trim());
      }
      blocks.push({ type: 'p', text: para.join(' ') });
    }
  }
  return blocks;
}

export default function RichText({ text, className = '' }) {
  if (!text) return null;
  const blocks = parseBlocks(text);
  return (
    <div className={`prose-lite ${className}`}>
      {blocks.map((b, i) => {
        if (b.type === 'code') return <CodeBlock key={i} code={b.code} lang={b.lang} />;
        if (b.type === 'ul')
          return <ul key={i}>{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ul>;
        if (b.type === 'ol')
          return <ol key={i}>{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ol>;
        if (b.type === 'h') return <h4 key={i}>{renderInline(b.text)}</h4>;
        return <p key={i}>{renderInline(b.text)}</p>;
      })}
    </div>
  );
}
