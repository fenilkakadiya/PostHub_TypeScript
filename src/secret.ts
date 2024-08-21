import dotenv  from "dotenv";
dotenv.config({path:'.env'});

export const PORT = process.env.PORT;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const EMAIL = process.env.EMAIL_USER;
export const PASS = process.env.EMAIL_PASS;