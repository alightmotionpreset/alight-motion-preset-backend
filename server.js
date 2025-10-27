import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import presetRoutes from './routes/presets.js';
import categoryRoutes from './routes/categories.js';
import purchaseRoutes from './routes/purchases.js';
import paymentInfoRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: '*', // Allow all origins for simplicity. For production, you might want to restrict this to your frontend's domain.
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/presets', presetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/payment-info', paymentInfoRoutes);
app.use('/api/admin', adminRoutes);

// Simple health check route
app.get('/api', (req, res) => {
  res.send('Alight Motion Preset API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});