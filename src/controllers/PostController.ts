import { Request, Response } from 'express';
import { prismaClient } from '..';

export const addPost = async (req: Request, res: Response) => {
  const { userId, title, description } = req.body;

  try {
    const userIdNumber = parseInt(userId, 10);
    const user = await prismaClient.user.findUnique({ where: { userId: userIdNumber} });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = await prismaClient.post.create({
      data: {
        title,
        description,
        user: { connect: { userId : userIdNumber  } },
      },
    });

    return res.json(post);
  } catch (error) {
    console.error('Error adding post:', error);
    return res.status(500).json({ message: 'Failed to add post' });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prismaClient.post.findMany({
      include: {
        user: true,
        comment : true
      },
    });

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No posts found' });
    }

    return res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }
};
