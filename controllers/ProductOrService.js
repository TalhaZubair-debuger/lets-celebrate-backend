const ProductOrService = require("../models/ProductOrService");
const { validationResult } = require("express-validator");
const Users = require("../models/users");

exports.getTopEventPlaces = async (req, res, next) => {
    try {
        const eventPlaces = await ProductOrService.find({
            category: "Event Place",
            // rating: { $gt: 3 } 
        });
        if (!eventPlaces) {
            res.status(404).send({ message: "No Top Event Places found" })
        }
        res.send({ eventPlaces });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getTopServices = async (req, res, next) => {
    try {
        const services = await ProductOrService.find({
            category: { $ne: "Event Place" },
            // rating: { $gt: 3 }
        });
        if (!services || services.length === 0) {
            res.status(404).send({ message: "No Top services found" });
            return;
        }
        res.send({ topServices: services });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.searchProductOrService = async (req, res, next) => {
    try {
        const { q: searchTerm, location, category, price } = req.query;

        // Construct the query object
        const query = {};
        if (searchTerm !== "Default" && searchTerm) {
            const regex = new RegExp(searchTerm, 'i');
            query.$or = [
                { description: { $regex: regex } },
                { title: { $regex: regex } },
                { tags: { $regex: regex } },
                { location: { $regex: regex } }
            ];
        }

        if (location) {
            const regexLocation = new RegExp(location, 'i');
            query.location = { $regex: regexLocation };
        }

        if (category !== "Default") {
            const regexCategory = new RegExp(category, 'i');
            query.category = { $regex: regexCategory };
        }

        if (price) {
            // Assuming price is a number and we want to filter for items less than or equal to the given price
            query.price = { $lte: Number(price) };
        }

        const eventServices = await ProductOrService.find(query);

        if (!eventServices || eventServices.length === 0) {
            return res.status(404).send({ message: "No products or services found" });
        }

        res.send({ eventServices });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};


exports.getAllProductServices = async (req, res, next) => {
    try {
        const eventServices = await ProductOrService.find().limit(10);
        if (!eventServices) {
            res.status(404).send({ message: "No Services or Event Places found" });
        }
        res.send({ eventServices });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getProduct = async (req, res, next) => {
    const productId = req.params.productId;
    try {
        const eventService = await ProductOrService.findById(productId);
        if (!eventService) {
            res.status(404).send({ message: "No Services or Event Places found" });
        }
        res.send({ eventService });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.myEventPlaces = async (req, res, next) => {
    const userId = req.userId;
    try {
        const eventService = await ProductOrService.find({ userId, category: { $eq: "Event Place" } });
        if (!eventService || eventService.length === 0) {
            res.status(404).send({ message: "No Event Places found" });
        }
        res.send({ eventService });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.myServices = async (req, res, next) => {
    const userId = req.userId;
    try {
        const services = await ProductOrService.find({ userId, category: { $ne: "Event Place" } });
        if (!services || services.length === 0) {
            res.status(404).send({ message: "No Services found" });
        }
        res.send({ services });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.addProduct = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed.");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const { image, title, description, location, category, tags, price, contactNumber, paymentPrivateKey, paymentPublicKey } = req.body;

    try {
        const product = new ProductOrService({
            image,
            title,
            description,
            location,
            category,
            tags,
            price,
            contactNumber,
            paymentPrivateKey,
            paymentPublicKey,
            userId: req.userId
        });
        const result = await product.save();
        res.status(201).json({ message: "Event Place/Service Created!", productId: result._id });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getOwnerBookings = async (req, res, next) => {
    const ownerId = req.userId; // Assuming req.userId contains the ID of the owner

    try {
        const productServices = await ProductOrService.find({ userId: ownerId, "bookings": { $exists: true, $not: { $size: 0 } } })
            .populate('bookings.buyerId', 'name')
            .select('title bookings');

        if (!productServices || productServices.length === 0) {
            return res.status(200).json({ message: "No Current Bookings found" });
        }

        const bookings = productServices.reduce((acc, productService) => {
            const { title, bookings } = productService;
            const bookingsWithTitle = bookings.map(booking => ({
                ...booking.toObject(),
                title
            }));
            return acc.concat(bookingsWithTitle);
        }, []);

        res.status(200).json({ bookings });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};



exports.completeBooking = async (req, res, next) => {
    const bookingId = req.params.bookingId;
    try {
        const productService = await ProductOrService.findOne({ "bookings._id": bookingId });
        if (!productService) {
            const error = new Error('Booking not found.');
            error.statusCode = 404;
            throw error;
        }
        const booking = productService.bookings.id(bookingId);
        booking.status = 'completed';
        await productService.save();
        res.status(200).json({ message: 'Booking completed.' });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.cancelBooking = async (req, res, next) => {
    const bookingId = req.params.bookingId;
    try {
        const productService = await ProductOrService.findOne({ "bookings._id": bookingId });
        if (!productService) {
            const error = new Error('Booking not found.');
            error.statusCode = 404;
            throw error;
        }
        const booking = productService.bookings.id(bookingId);
        booking.status = 'cancelled';
        await productService.save();
        res.status(200).json({ message: 'Booking cancelled.' });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};


exports.getBestServices = async (req, res) => {
    const allCategories = ['Event Place', 'Catering', 'Fireworks', 'Flower Decorations'];
    const { category } = req.params;

    try {
        const otherCategories = allCategories.filter(cat => cat !== category);
        const bestServices = [];

        for (let cat of otherCategories) {
            const bestService = await ProductOrService.findOne({ category: cat }).sort({ rating: -1 }).exec();
            if (bestService) {
                bestServices.push(bestService);
            }
        }

        res.status(200).json({ bestServices });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.getSearchByCategory = async (req, res, next) => {
    const category = req.body.category;
    try {
        const services = await ProductOrService.find({ category: { $eq: category } });
        if (!services || services.length === 0) {
            res.status(404).send({ message: "No Event Places/Services found" });
        }
        res.send({ services });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.postMakePaymentRequest = async (req, res, next) => {
    const { amount, date, quantity } = req.body;
    const { productId } = req.params;

    try {
        const product = await ProductOrService.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found!" });
        }

        const user = await Users.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const bookingDate = new Date(date).setHours(0, 0, 0, 0);
        const existingBooking = product.bookings.find(booking =>
            new Date(booking.date).setHours(0, 0, 0, 0) === bookingDate
        );

        if (existingBooking) {
            return res.status(400).json({ message: "This day is already booked!" });
        }


        // Payment gateway
        const stripe = require('stripe')(product.paymentPrivateKey);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'pkr',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // const newBooking = {
        //     buyerId: user._id,
        //     date: new Date(date),
        //     status: 'pending',
        //     pricePaid: amount,
        //     contact: user.contact,
        //     quantity: quantity,
        // };

        // product.bookings.push(newBooking);
        // await product.save();

        res.json({ paymentIntent: paymentIntent.client_secret });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.postBookEventPlaceOrService = async (req, res, next) => {
    const { amount, date, quantity } = req.body;
    const { productId } = req.params;

    try {
        const product = await ProductOrService.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found!" });
        }

        const user = await Users.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const newBooking = {
            buyerId: user._id,
            date: new Date(date),
            status: 'pending',
            pricePaid: amount,
            contact: user.contact,
            quantity: quantity ? quantity : 1
        };

        product.bookings.push(newBooking);
        await product.save();

        res.json({ message: "Event Place/Serice booked!" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};