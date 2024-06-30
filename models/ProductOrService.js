const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    buyerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending','completed', 'cancelled'],
        default: 'pending'
    },
    pricePaid: {
        type: Number,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: false
    }
}, {
    timestamps: true
});

const ProductServiceSchema = new Schema({
    image: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Event Place', 'Catering', 'Fireworks', 'Flower Decorations', 'Photographer'],
    },
    tags: {
        type: [String], // Array of tags
        default: [],
    },
    price: {
        type: Number,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    paymentPrivateKey: {
        type: String,
        required: true,
        trim: true,
    },
    paymentPublicKey: {
        type: String,
        required: true,
        trim: true,
    },
    rating: {
        type: Number,
        required: false,
        min: 0,
        max: 5
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bookings: [BookingSchema]
}, {
    timestamps: true,
});

module.exports = mongoose.model('ProductService', ProductServiceSchema);
