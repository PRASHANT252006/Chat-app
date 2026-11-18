const { customApiError } = require("../error/customApiError");

const errorHandlerMiddleware = (err, req, res, next) => {
    if (err instanceof customApiError) {
        return res.status(err.statusCode).send(err.message);
    }

    res.status(500).send("Internal Server Error");
};

module.exports = { errorHandlerMiddleware };