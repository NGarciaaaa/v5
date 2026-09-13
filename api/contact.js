import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const email = String(req.body?.email ?? '').trim();
  const message = String(req.body?.message ?? '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, message: 'Please complete all fields.' });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ ok: false, message: 'Please enter a valid email address.' });
  }

  // Email provider integration belongs here. Keep the API route isolated so it can
  // later call Resend, Nodemailer, Firebase, or another email service without changing the UI.
  return res.json({
    ok: true,
    message: `Thanks, ${name}! Your message was received by the portfolio server.`,
  });
});

export default router;
