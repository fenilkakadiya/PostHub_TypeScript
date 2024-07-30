import express from 'express';
import { addComment, deleteComment, editComment } from '../controllers/commentController';
import { authenticateToken } from '../middleware/auth';
const router = express.Router();

router.post('/comment',authenticateToken, addComment);
router.post('/editcomment',authenticateToken,editComment);
router.post('/deletecomment',authenticateToken,deleteComment);

export default router;
