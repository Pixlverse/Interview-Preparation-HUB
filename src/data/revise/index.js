// Revise MERN: the top 25 interview questions per topic, with short spoken-style answers,
// for a last read just before an interview. One file per group; the order here is the page order.
import htmlCss from './html-css.js';
import javascript from './javascript.js';
import react from './react.js';
import redux from './redux.js';
import nodejs from './nodejs.js';
import express from './express.js';
import mongodb from './mongodb.js';
import typescript from './typescript.js';
import optimization from './optimization.js';
import security from './security.js';
import postgresql from './postgresql.js';
import aws from './aws.js';
import llm from './llm.js';
import claude from './claude.js';

export const REVISE_GROUPS = [
  htmlCss,
  javascript,
  react,
  redux,
  nodejs,
  express,
  mongodb,
  typescript,
  optimization,
  security,
  postgresql,
  aws,
  llm,
  claude,
];

export const REVISE_COUNT = REVISE_GROUPS.reduce((n, g) => n + g.items.length, 0);
