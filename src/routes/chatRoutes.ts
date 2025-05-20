import { Router } from 'express';
import chatController from '../controllers/chatController';

const router = Router();

// Route for handling chat messages
router.post('/message', chatController.handleChatMessage);

// Route for clearing/resetting a chat session
router.delete('/session/:sessionId', chatController.resetChatSession);

export default router;
