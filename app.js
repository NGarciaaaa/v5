import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import apiRouter from './api/router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: '7d', immutable: true }));
app.use('/src', express.static(path.join(__dirname, 'src'), { maxAge: '1h' }));

async function component(name) {
  return fs.readFile(path.join(__dirname, 'components', `${name}.html`), 'utf8');
}

async function renderPage() {
  const shell = await fs.readFile(path.join(__dirname, 'src', 'home', 'index.html'), 'utf8');
  const [navbar, home, about, gallery, contact, footer] = await Promise.all([
    component('navbar'),
    component('home'),
    component('aboutme'),
    component('galary'),
    component('contactme'),
    component('footer')
  ]);

  return shell
    .replace('<!-- NAVBAR -->', navbar)
    .replace('<!-- HOME -->', home)
    .replace('<!-- ABOUT -->', about)
    .replace('<!-- GALLERY -->', gallery)
    .replace('<!-- CONTACT -->', contact)
    .replace('<!-- FOOTER -->', footer);
}

app.get('/', async (_req, res, next) => {
  try {
    res.type('html').send(await renderPage());
  } catch (error) {
    next(error);
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'noah-garcia-portfolio' });
});

app.use('/api', apiRouter);

app.use(async (req, res, next) => {
  try {
    res.status(404).type('html').send(await component('404'));
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ ok: false, message: 'Internal server error.' });
});

export default app;
