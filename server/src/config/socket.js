let io = null;

const setIO = (socketIO) => {
  io = socketIO;
};

const getIO = () => {
    if (!io) {
        console.warn("IO not initialized yet.");
    }

    return io;
};

export { setIO, getIO };