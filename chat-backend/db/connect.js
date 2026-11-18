const mongoose = require("mongoose");

const connect = async (URL) => {
    const db = await mongoose.connect(URL);

    console.log("Host:", db.connection.host);
    console.log("Port:", db.connection.port);
    console.log("Database:", db.connection.name);
    console.log("Ready State:", db.connection.readyState);
    console.log("Connection ID:", db.connection.id);
};

module.exports = connect;