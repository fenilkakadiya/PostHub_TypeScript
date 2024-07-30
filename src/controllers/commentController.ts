import { Request, Response } from 'express';
import { prismaClient } from '..';
import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}


export const addComment = async (req: Request, res: Response) => {
  const { postId, comment } = req.body;
  const userId = req.user?.userId

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const postIdNumber = parseInt(postId);

    const existingPost = await prismaClient.post.findUnique({
      where: { id: postIdNumber },
    });

    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = await prismaClient.comment.create({
      data: {
        comment,
        post_id: postIdNumber,
        user_id: userId,
      },
    });

    await prismaClient.post.update({
      where: { id: postIdNumber },
      data: { comment_count: { increment: 1 } },
    });

    return res.json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ message: 'Failed to add comment' });
  }
};



export const editComment = async (req: Request, res: Response) => {
  const { commentId, newComment } = req.body;
  const userId = req.user?.userId

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const existingComment = await prismaClient.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (existingComment.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only edit your own comments' });
    }

    const updatedComment = await prismaClient.comment.update({
      where: { id: commentId },
      data: { comment: newComment },
    });

    return res.json(updatedComment);
  } catch (error) {
    console.error('Error editing comment:', error);
    return res.status(500).json({ message: 'Failed to edit comment' });
  }
};


export const deleteComment = async (req: Request, res: Response) => {
  const { commentId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const existingComment = await prismaClient.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    console.log(existingComment.user_id , userId)

    if (existingComment.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own comments' });
    }

    await prismaClient.comment.delete({
      where: { id: commentId },
    });

    await prismaClient.post.update({
      where: { id: existingComment.post_id },
      data: { comment_count: { decrement: 1 } },
    });

    return res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ message: 'Failed to delete comment' });
  }
};
