import { Router } from 'express';
import { getData } from './database.js';

const router = Router();

router.get('/lab-data', async (_req, res) => {
    try {
        const data = await getData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load lab data', error: error.message });
    }
});

export default router;
