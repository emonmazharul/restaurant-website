import express from 'express'
import path from 'path';
import { fileURLToPath } from "url";
import http from 'http'
import session from "express-session";
import cors from 'cors'
import helmet from 'helmet';
import userRouter from './route/userRoute.js';
import menuRouter from './route/menuRoute.js';
import reservationRouter from './route/reservationRoute.js'
import orderRouter from './route/orderRoute.js'
import adminRouter from './route/adminRoute.js'
import saleRouter from './route/saleRoute.js'
import testRouter from './route/testRoute.js'

// const db = drizzle(process.env.DB_FILE_NAME);
// await (bread)
// await db.delete(orderTable);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '..' , 'public')

const app = express();
app.use(express.static(publicPath))


app.use(cors({origin:'http://localhost:5173',credentials:true}))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(session({
    name:process.env.SESSION_NAME,
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    cookie: {
        secure:false,
    },
}))
// app.use(helmet());
app.use('/user', userRouter);
app.use('/menu', menuRouter)
app.use('/reservation', reservationRouter);
app.use('/order', orderRouter);
app.use('/admin', adminRouter);
app.use('/sale', saleRouter);
app.use('/test', testRouter);
// app.get('/', (req,res) => {
//     res.send({message:'welcome to the anware restaurant backend'});
// })
app.get('*nothing', (req,res) => {
    res.sendFile(path.join(publicPath+'/index.html'))
})

const server = http.createServer(app);

export default server;