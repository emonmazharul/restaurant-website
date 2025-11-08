import {Server} from 'socket.io'
import myServer from "./index.js";
import { searchOrder } from './utils/searchOrder.js';
import { searchReservation } from './utils/searchReservation.js';



export const io = new Server(myServer, {
    cors: {origin:'http://localhost:5173'}
});

io.on('connection', (socket) => {
    socket.on('newOrder', async (orderId) => {
        const order = await searchOrder(orderId);
        if(order) io.emit('newOrder', order);
    })
    socket.on('newReservation', async (id) => {
        const reservation = await searchReservation(id);
        if(reservation) {
            io.emit('newReservation', reservation);
        }
    })
})

myServer.listen(process.env.PORT || 5000, (err) => {
    if(err) throw err
    console.log(`server is listening on port ${process.env.PORT}`);
})

export default myServer;