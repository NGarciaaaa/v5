import { Router } from 'express';
import contactRouter from './contact.js';

const router = Router();

// Add future API routers here, for example:
// router.use('/email', emailRouter);
// router.use('/projects', projectsRouter);
// router.use('/analytics', analyticsRouter);

router.get('/', (_req, res) => {
  res.json({ ok: true, service: 'noah-garcia-portfolio-api' });
});

router.use('/contact', contactRouter);

export default router;
