import app from './app.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Noah Garcia portfolio running at http://localhost:${PORT}`);
});
