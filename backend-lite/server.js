import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DESIGNERS = [
  { id: 1, name: 'Atelier Sol', specialty: 'Evening couture', verified: true },
  { id: 2, name: 'Maison Rio', specialty: 'Resort wear', verified: false },
  { id: 3, name: 'Studio Aria', specialty: 'Tailored suiting', verified: true },
];

const PRODUCTS = [
  { id: 101, title: 'Velvet Column Gown', priceCents: 420000 },
  { id: 102, title: 'Sculpted Silk Blazer', priceCents: 185000 },
  { id: 103, title: 'Hand-dyed Kaftan', priceCents: 98000 },
  { id: 104, title: 'Crystal Mesh Mini', priceCents: 154000 },
  { id: 105, title: 'Featherweight Hoodie', priceCents: 54000 },
  { id: 106, title: 'Architected Trouser', priceCents: 76000 },
  { id: 107, title: 'Luminous Slip Dress', priceCents: 132000 },
  { id: 108, title: 'Ceremonial Cape', priceCents: 215000 },
  { id: 109, title: 'Convertible Midi', priceCents: 118000 },
  { id: 110, title: 'Structured Denim Corset', priceCents: 87000 }
];

app.get('/api/designers', (req, res) => {
  res.json({ designers: DESIGNERS });
});

app.get('/api/products', (req, res) => {
  const limit = Number(req.query.limit) || 9;
  const items = PRODUCTS.slice(0, limit);
  res.json({ products: items, total: PRODUCTS.length });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Lightweight API running on http://localhost:${PORT}`);
});
