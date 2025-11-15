import express from 'express'
import path from 'path';
import { fileURLToPath } from "url";
import http from 'http'
import session from "express-session";
import cors from 'cors'
import helmet from 'helmet';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from "pg";
import userRouter from './route/userRoute.js';
import menuRouter from './route/menuRoute.js';
import reservationRouter from './route/reservationRoute.js'
import orderRouter from './route/orderRoute.js'
import adminRouter from './route/adminRoute.js'
import saleRouter from './route/saleRoute.js'
import testRouter from './route/testRoute.js'

import InsertItems from './utils/insert_menu.js';



export const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '..' , 'public')

export const app = express();
app.set('trust proxy', 1);
app.use(express.static(publicPath))

app.use(cors({origin:'http://localhost:5173',credentials:true}))
app.use(express.urlencoded({extended:true}))
app.use(express.json())

const pgStore = new connectPgSimple(session);

app.use(session({
    store: new pgStore({
        pool,

    }),
    name:process.env.SESSION_NAME,
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie: {
        secure:false,
        maxAge: 14 * 24 * 60 * 60 * 1000
    },
}))

app.use(helmet());
app.use('/api/user', userRouter);
app.use('/api/menu', menuRouter)
app.use('/api/reservation', reservationRouter);
app.use('/api/order', orderRouter);
app.use('/api/admin', adminRouter);
app.use('/api/sale', saleRouter);
app.use('/api/test', testRouter);
// app.get('/', (req,res) => {
//     res.send({message:'welcome to the anware restaurant backend'});
// })
app.get('*nothing', (req,res) => {
    res.sendFile(path.join(publicPath+'/index.html'))
})

const server = http.createServer(app);

export default server;