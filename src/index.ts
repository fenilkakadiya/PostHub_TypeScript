import express,{Express, query, request,response, urlencoded } from "express";
import cookieParser from "cookie-parser";
import userRouter from './routes/userRoute';
import postRouter from './routes/postRoute';
import commentRouter from './routes/commentRoute';
import { PORT } from "./secret";
import { PrismaClient} from "@prisma/client";
const app:Express = express();


app.use(express.urlencoded({extended:false}));
app.use(express.json())
app.use(cookieParser());
export const prismaClient = new PrismaClient({log :['query']})

app.use(userRouter)
app.use(postRouter)
app.use(commentRouter)


app.listen(PORT,()=>{
console.log(`server is running on http://localhost/${PORT}`)
})