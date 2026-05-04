import { Router } from 'express';
import { createRoom, getRooms, getRoom, endRoom, getGlobalStats } from '../controllers/room.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats/global', getGlobalStats);

router.route('/')
  .get(getRooms)
  .post(protect, createRoom);

router.route('/:id')
  .get(getRoom);

router.patch('/:id/end', protect, endRoom);

export default router;
