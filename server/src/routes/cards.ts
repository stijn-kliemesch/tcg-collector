import { Router } from 'express';
import { db } from '../services/db';

const router = Router();

// Get all cards
router.get('/', async (req, res) => {
  try {
    const cards = await db.getAllCards();
    res.json(cards);
  } catch {
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Add a new card
router.post('/', async (req, res) => {
  try {
    const card = await db.addCard(req.body);
    res.status(201).json(card);
  } catch {
    res.status(500).json({ error: 'Failed to add card' });
  }
});

// Update a card
router.put('/:id', async (req, res) => {
  try {
    const card = await db.updateCard(req.params.id, req.body);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(card);
  } catch {
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete a card
router.delete('/:id', async (req, res) => {
  try {
    const success = await db.deleteCard(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// Load example data
router.post('/load-example', async (req, res) => {
  try {
    const { exampleCards } = await import('../data/example-cards');
    for (const card of exampleCards) {
      await db.addCard(card);
    }
    const cards = await db.getAllCards();
    res.status(201).json(cards);
  } catch {
    res.status(500).json({ error: 'Failed to load example data' });
  }
});

// Clear all cards
router.delete('/', async (req, res) => {
  try {
    const cards = await db.getAllCards();
    for (const card of cards) {
      await db.deleteCard(card.id);
    }
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to clear database' });
  }
});

export default router;
