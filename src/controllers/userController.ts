import { Request, Response } from 'express';
import { prismaClient } from '..';
import { hashSync,compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import nodemailer from 'nodemailer'
import { JWT_SECRET } from '../secret';


export const  signup = async (req:Request,res:Response)=>{
    const { userName , Email, password } = req.body;

    if (!userName || !Email || !password) {
        return res.json({
          message: 'Username, email, and password are compulsory',
        });
      }
    
      if (!Email.includes('@')) {
        return res.json({ message: "Email must contain '@' symbol" });
      }
    
      if (
        !(
          /[A-Z]/.test(password) &&
          /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
          password.length >= 6
        )
      ) {
        return res.json({
          message:
            'Password must contain at least one uppercase letter, one special char, and must have 6 characters',
        });
      }

      let user = await prismaClient.user.findFirst({where : {Email}})
      if(user){
        res.json({message :'user already exists'});
      }
      user = await prismaClient.user.create({
        data:{
          userName,
          Email,
          password: hashSync(password, 10)
        }
      });

       return res.json(user);
}


export const  login = async (req:Request,res:Response)=>{
  const { Email, password } = req.body;

  if (!Email || !password) {
      return res.json({
        message: 'email, and password are compulsory',
      });
    }

    let user = await prismaClient.user.findFirst({where : {Email}})
    if(!user){
      return res.json({message :'email does not exists'});
    }
    if(!compareSync(password ,user.password)){
       return res.json({message :'incorrect password'})
    }
    const token = jwt.sign({
      userId :user.userId
    },JWT_SECRET,{ expiresIn: '1h' });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 6 * 60 * 60 * 1000,
    });

     return res.json({user,token});
}

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ message: 'Successfully logged out' });
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({
      message: 'Current password, new password, and confirm new password are compulsory',
    });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }

  if (
    !(
      /[A-Z]/.test(newPassword) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) &&
      newPassword.length >= 6
    )
  ) {
    return res.status(400).json({
      message:
        'New password must contain at least one uppercase letter, one special char, and must have 6 characters',
    });
  }

  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Access token is missing or invalid' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    let user = await prismaClient.user.findUnique({ where: { userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!compareSync(currentPassword, user.password)) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    const hashedNewPassword = hashSync(newPassword, 10);
    await prismaClient.user.update({
      where: { userId },
      data: { password: hashedNewPassword },
    });

    return res.json({ message: 'Password successfully changed' });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};


const transporter = nodemailer.createTransport({
  service: 'Gmail', // You can use other services like 'SendGrid', 'Mailgun', etc.
  auth: {
    user: 'fenilkakadiya7777@gmail.com',
    pass: 'rkue vcak sned qjxv',
  },
});

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:6060/reset-password?token=${token}`;

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Click the link below to reset your password:</p>
           <a href="${resetLink}">Reset Password</a>`,
  };

  return transporter.sendMail(mailOptions);
};


export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await prismaClient.user.findUnique({ where: { Email: email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '1h' });

    await sendPasswordResetEmail(email, token);

    return res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return res.status(500).json({ message: 'Failed to request password reset' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { newPassword, confirmNewPassword } = req.body;
  const token = req.cookies.token;

  if (!token || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: 'Token, new password, and confirm new password are required' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }

  if (
    !(
      /[A-Z]/.test(newPassword) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) &&
      newPassword.length >= 6
    )
  ) {
    return res.status(400).json({
      message:
        'New password must contain at least one uppercase letter, one special char, and must have 6 characters',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const user = await prismaClient.user.findUnique({ where: { userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedNewPassword = hashSync(newPassword, 10);
    await prismaClient.user.update({
      where: { userId },
      data: { password: hashedNewPassword },
    });

    return res.json({ message: 'Password successfully reset' });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};








