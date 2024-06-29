const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/users");
const productOrServiceRoutes = require("./routes/ProductOrService");

require("dotenv").config();

const MONGO_URI =
    `mongodb+srv://talhazubairinfo:hussbilatz@fyp-cluter.qauvmhw.mongodb.net/LetsCelebrate?retryWrites=true&w=majority`;
    // "mongodb://127.0.0.1:27017/LetsCelebrate";
const app = express();

app.use(bodyParser.json({ limit: '20mb' }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS ,GET, POST, PUT, PATCH, DELETE")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
    next();
})

app.use("/users", userRoutes);
app.use("/product-services", productOrServiceRoutes)


mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected!");
        app.listen(8080);
    })
    .catch(err => {
        console.log(err)
    })

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;

    res.status(status).json({ message: message, data: data })
})    