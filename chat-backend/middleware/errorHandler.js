
const { customApiError } = require("../error/customApiError");

const errorHandlerMiddleware = (err, req, res, next) => {

    // Custom API Error
    if (err instanceof customApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID"
        });
    }

    // Duplicate Key Error
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Duplicate value already exists"
        });
    }

    // JWT Errors
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Access token has expired"
        });
    }

    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid access token"
        });
    }

    if (err.name === "NotBeforeError") {
        return res.status(401).json({
            success: false,
            message: "Token is not active yet"
        });
    }

    // Missing Mongoose Model
    if (err.name === "MissingSchemaError") {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Database model configuration error"
        });
    }

    // MongoDB Connection Error
    if (err.name === "MongooseServerSelectionError") {
        console.error(err);
        return res.status(503).json({
            success: false,
            message: "Database unavailable"
        });
    }

    // Unknown Error
    console.error(err);

    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
};

module.exports = { errorHandlerMiddleware };
