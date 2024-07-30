import { Router} from "express";
import { addPost, getAllPosts} from "../controllers/PostController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
router.post('/addpost',authenticateToken,addPost);
router.get('/posts',authenticateToken,getAllPosts)
export default router
