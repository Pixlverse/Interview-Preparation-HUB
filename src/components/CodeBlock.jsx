import { useMemo, useState } from 'react';
import hljs from 'highlight.js/lib/common';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import nginx from 'highlight.js/lib/languages/nginx';

hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('nginx', nginx);

const ALIASES = {
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  html: 'xml',
  svg: 'xml',
  text: 'plaintext',
  txt: 'plaintext',
  yml: 'yaml',
  env: 'ini',
  docker: 'dockerfile',
  mongo: 'javascript',
  mongodb: 'javascript',
  postgres: 'sql',
  psql: 'sql',
  hcl: 'plaintext',
  terraform: 'plaintext',
};

export default function CodeBlock({ code, lang = 'javascript', title }) {
  const [copied, setCopied] = useState(false);
  const language = ALIASES[lang] || lang;
  const source = (code || '').replace(/^\n+|\s+$/g, '');

  const html = useMemo(() => {
    try {
      if (hljs.getLanguage(language)) return hljs.highlight(source, { language }).value;
    } catch {
      /* fall through */
    }
    return source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }, [source, language]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = source;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-2 text-xs dark:border-slate-800">
        <span className="truncate font-medium text-slate-500 dark:text-slate-400">{title || lang}</span>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-md border border-slate-300 px-2 py-0.5 font-medium text-slate-600 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre className="thin-scroll overflow-x-auto p-4 text-[13px] leading-6">
        <code className="hljs font-mono" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
