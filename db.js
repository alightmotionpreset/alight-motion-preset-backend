import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use an absolute path for the database file
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);

const defaultData = {
  presets: [
    { id: 'p1', name: 'Urban Glow', categoryId: '1', price: 150, imageUrl: 'https://picsum.photos/seed/urbanglow/400/300', likes: 125, presetLink: 'https://example.com/preset/urban-glow' },
    { id: 'p2', name: 'Film Look', categoryId: '2', price: 200, imageUrl: 'https://picsum.photos/seed/filmlook/400/300', likes: 230, presetLink: 'https://example.com/preset/film-look' },
    { id: 'p3', name: 'Soft Vibe', categoryId: '3', price: 120, imageUrl: 'https://picsum.photos/seed/softvibe/400/300', likes: 410, presetLink: 'https://example.com/preset/soft-vibe' },
    { id: 'p4', name: 'Retro 80s', categoryId: '4', price: 180, imageUrl: 'https://picsum.photos/seed/retro80s/400/300', likes: 350, presetLink: 'https://example.com/preset/retro-80s' },
    { id: 'p5', name: 'Neon Nights', categoryId: '1', price: 160, imageUrl: 'https://picsum.photos/seed/neonnights/400/300', likes: 50, presetLink: 'https://example.com/preset/neon-nights' },
    { id: 'p6', name: 'Epic Movie', categoryId: '2', price: 250, imageUrl: 'https://picsum.photos/seed/epicmovie/400/300', likes: 180, presetLink: 'https://example.com/preset/epic-movie' },
  ],
  categories: [
    { id: '1', name: 'Trending' },
    { id: '2', name: 'Cinematic' },
    { id: '3', name: 'Aesthetic' },
    { id: '4', name: 'Vintage' },
  ],
  purchases: [],
  paymentInfo: {
    gcashName: 'Juan Dela Cruz',
    gcashNumber: '09171234567',
    paypalEmail: 'juan.dela.cruz@example.com',
  },
  admin: {
    passwordHash: null,
    pinHash: null,
  }
};

const db = new Low(adapter, defaultData);

// Encapsulate initialization in an async function for better error handling
const initializeDatabase = async () => {
    try {
        await db.read();
    } catch (e) {
        console.error("Error reading db.json, it might be corrupted. Resetting with default data.", e);
        // If reading fails, reset the data in memory to default
        db.data = defaultData;
        // And write it back to the file to fix corruption
        await db.write();
        return; // Initialization is complete after reset
    }

    // If file is empty or doesn't have the main keys, initialize it with default data.
    if (!db.data || !db.data.presets || !db.data.categories || !db.data.admin) {
        console.log("Database file is missing required data structures. Initializing with default data.");
        db.data = defaultData;
        await db.write();
    }
};

// Initialize the database before exporting
await initializeDatabase();

export default db;