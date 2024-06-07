import io from 'socket.io-client';

let socket;
const connectSocket = (serverUrl) => {
    if(!socket) {
        socket = io(serverUrl, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 5,
            timeout: 20000
        });

        socket.on('connect', () => {
            console.log("Socket 연결");
        });

        socket.on('disconnect', (reason) => {
            console.log("Socket 연결 해제 : ", reason);
        });

        socket.on('connect_error', (error) => {
            console.log("Socket 연결 ERROR : ", error);
        });
    }
};

const getSocket = () => {
    if(!socket) {
        throw new Error("Socket is not initialized. Call connectSocket first.")
    }
    return socket;
};

export { connectSocket, getSocket };