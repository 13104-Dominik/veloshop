require('dotenv').config();
const app = require('./app');

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('Brak JWT_SECRET w środowisku produkcyjnym.');
  process.exit(1);
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`VeloShop API działa na porcie ${port}`));
