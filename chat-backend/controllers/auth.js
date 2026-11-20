const { customApiError } = require('../error/customApiError.js');
const bcrypt = require('bcryptjs');
const user = require('../models/user.js');
const session = require('../models/session.js');
const crypto = require('crypto');
const { uploadOnCloudinary } = require('../utils/cloudinary.js');
const jwt = require('jsonwebtoken');

const sendcookies = (res, refreshtoken, accesstoken) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie('accesstoken', accesstoken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
    });
};

const login = async (req, res) => {
    console.log("Content-Type:", req.headers['content-type']);
    console.log("Body:", req.body);
    const { email, password } = req.body;

    if (
        !email ||
         !password
    ) {
        throw new customApiError(400, 'Email and password are required');
    }

    const email1 = email.trim();

    const user1 = await user.findOne({ email: email1 });

    if (!user1) {
        throw new customApiError(401, 'Invalid email or password');
    }

    const ispasswordcorrect = await bcrypt.compare(
        password,
        user1.password
    );

    if (!ispasswordcorrect) {
        throw new customApiError(401, 'Invalid email or password');
    }

    const accesstoken = jwt.sign(
        {
            _id: user1._id,
            username: user1.username,
            email: user1.email
        },
        process.env.access_Token_Secret,
        { expiresIn: '15m' }
    );

    const refreshtoken = jwt.sign(
        { _id: user1._id },
        process.env.refresh_Token_Secret,
        { expiresIn: '7d' }
    );

    const hashedRefreshToken = crypto
        .createHash('sha256')
        .update(refreshtoken)
        .digest('hex');

    await session.create({
        user: user1._id,
        refreshtoken: hashedRefreshToken
    });

    sendcookies(res, refreshtoken, accesstoken);

    const loggedInUser = await user.findById(user1._id)
        .select('-password');

    return res.status(200).json({
        message: 'Login successful',
        user: loggedInUser
    });
};

const register = async (req, res) => {
    const { username, email, password } = req.body;

    if (
        !username ||
        !email ||
        !password
    ) {
        throw new customApiError(
            400,
            'Username, email and password are required'
        );
    }

    const username1 = username.trim();
    const email1 = email.trim().toLowerCase();

    if (username1.length < 3) {
        throw new customApiError(400, 'Username must be at least 3 characters');
    }

    if (password.length < 6) {
        throw new customApiError(400, 'Password must be at least 6 characters');
    }

    const existedUser = await user.findOne({
        $or: [
            { email: email1 },
            { username: username1 }
        ]
    });

    if (existedUser) {
        throw new customApiError(409, 'Username or email already exists');
    }

    const image = req.file?.path;
    console.log("Uploaded image path:", image);
    let response = null;

    if (image) {
        response = await uploadOnCloudinary(image);
        console.log("Cloudinary response:", response);
    }

    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

    const avatarurl = response?.secure_url || undefined;
console.log("Avatar URL:", avatarurl);
    const User = await user.create({
        username: username1,
        email: email1,
        password: hashpassword,
        ...(avatarurl && { avatar: avatarurl })
        // console.log("Avatar URL:", avatarurl);
    });

    const resUser = await user.findById(User._id)
        .select('-password');

    return res.status(201).json({
        message: 'Registration successful',
        user: resUser
    });
};


const refreshaccessToken = async (req, res) => {

    const refreshtoken = req.cookies?.refreshtoken;

    if (!refreshtoken) {
        throw new customApiError(401, "Unauthorized");
    }

    let decoded;

    try {
        decoded = jwt.verify(
            refreshtoken,
            process.env.refresh_Token_Secret
        );
    } catch (error) {
        throw new customApiError(401, "Invalid or expired refresh token");
    }

    const hashedRefreshToken = crypto
        .createHash('sha256')
        .update(refreshtoken)
        .digest('hex');

    const session1 = await session.findOne({
        user: decoded._id,
        refreshtoken: hashedRefreshToken
    });

    if (!session1) {
        throw new customApiError(401, "Invalid refresh token");
    }

    const user1 = await user.findById(session1.user);

    if (!user1) {
        throw new customApiError(401, "User not found");
    }

    const accesstoken = jwt.sign(
        {
            _id: user1._id,
            username: user1.username,
            email: user1.email
        },
        process.env.access_Token_Secret,
        { expiresIn: '15m' }
    );

    res.cookie('accesstoken', accesstoken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
    });
    console.log("Access token refreshed successfully");

    return res.status(200).json({
        message: "Access token refreshed successfully"
    });
};

module.exports = { login, register,refreshaccessToken };
