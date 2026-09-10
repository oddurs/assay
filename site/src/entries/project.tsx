import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProjectPage } from '../pages/ProjectPage';
import '../reset.css';

const root = document.getElementById('root')!;
// The slug is stamped into the HTML by scripts/gen-pages.mjs, so the page does
// not have to parse a pathname that changes under a Pages base path.
const slug = root.dataset.project ?? '';

createRoot(root).render(
  <StrictMode>
    <ProjectPage slug={slug} />
  </StrictMode>,
);
