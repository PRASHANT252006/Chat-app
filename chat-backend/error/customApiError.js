
class customApiError extends Error {
    constructor(statusCode, message) {
        super(message);

        this.statusCode = statusCode;
        this.name = "customApiError";

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { customApiError };
