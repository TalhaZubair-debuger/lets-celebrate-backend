const User = require("../models/users.js");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed.");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const contact = req.body.contact;
    const confirmPassword = req.body.confirmPassword;

    const checkExistingUser = await User.findOne({ email });
    if (checkExistingUser) {
        res.status(409).json({ message: "Email Already exists" });
        return;
    }

    if (password !== confirmPassword) {
        const error = new Error("Password didn't match!");
        error.statusCode = 401;
        throw error;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            name,
            contact,
            password: hashedPassword
        })
        const result = await user.save();
        res.status(201).json({ message: "User Created!", userId: result._id });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.loginOwner = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            res.status(401).json({ message: "A user with this Email could not be found!" })
            return;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            res.status(401).json({ message: "Wrong Password!" });
            return;
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            "ownerissecureandprioritized",
            { expiresIn: "1h" }
        )
        res.status(200).json({ tokenOwner: token, userId: loadedUser._id.toString() })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.loginUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            res.status(401).json({ message: "A user with this Email could not be found!" })
            return;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            res.status(401).json({ message: "Wrong Password!" });
            return;
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            "thesupersecretshit",
            { expiresIn: "1h" }
        )
        res.status(200).json({ token: token, userId: loadedUser._id.toString() })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getUser = async (req, res, next) => {
    const user = req.userId;
    try {
        const userResponse = await User.findById(user).select('-password');;
        if (!userResponse) {
            res.status(409).json({ message: "User is not authorized!" })
            return;
        }
        res.status(200).json({ user: userResponse });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getUserById = async (req, res, next) => {
    const user = req.params.userId;
    try {
        const userResponse = await User.findById(user);
        if (!userResponse) {
            res.status(409).json({ message: "User not found!" })
            return;
        }
        res.status(200).json({ user: userResponse });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}