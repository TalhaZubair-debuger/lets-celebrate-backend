const express = require("express");
const ProductOrServiceController = require("../controllers/ProductOrService");
const { body } = require("express-validator");
const isAuth = require("../middlewares/is-auth");
const router = express.Router();

router.post(
    '/add-product',
    [
        body('image').notEmpty().withMessage('Image is required'),
        body('title').notEmpty().withMessage('Title is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('location').notEmpty().withMessage('Location is required'),
        body('category').notEmpty().withMessage('Category is required'),
        body('tags').notEmpty().withMessage('Tags are required'),
        body('price').isNumeric().withMessage('Price should be a number'),
        body('contactNumber').isLength({ min: 10 }).withMessage('Contact number should be at least 10 characters long'),
        body('paymentPrivateKey').notEmpty().withMessage('Payment key is required'),
        body('paymentPublicKey').notEmpty().withMessage('Public key is required')
    ],
    isAuth,
    ProductOrServiceController.addProduct
);

router.get("/top-eventplaces", isAuth, ProductOrServiceController.getTopEventPlaces);

router.get("/top-services", isAuth, ProductOrServiceController.getTopServices);

router.get('/search', isAuth, ProductOrServiceController.searchProductOrService);

router.get("/all", isAuth, ProductOrServiceController.getAllProductServices);

router.get("/product/:productId", isAuth, ProductOrServiceController.getProduct)

router.get('/my-eventplaces', isAuth, ProductOrServiceController.myEventPlaces);

router.get('/my-services', isAuth, ProductOrServiceController.myServices);

router.get("/get-owner-bookings", isAuth, ProductOrServiceController.getOwnerBookings);

router.post('/bookings/complete/:bookingId', isAuth, ProductOrServiceController.completeBooking);

router.post('/bookings/cancel/:bookingId', isAuth, ProductOrServiceController.cancelBooking);

router.get('/similar-services/:category', isAuth, ProductOrServiceController.getBestServices);//to be changed

router.post("/search-by-category", isAuth, ProductOrServiceController.getSearchByCategory);

router.post('/make-payment/:productId', isAuth, ProductOrServiceController.postMakePaymentRequest);

router.post('/book-service/:productId', isAuth, ProductOrServiceController.postBookEventPlaceOrService);

router.get("/get-user-bookings", isAuth, ProductOrServiceController.getUserBookings);

router.put('/product/:productId', isAuth, ProductOrServiceController.updateProduct);

router.delete('/product/:productId', isAuth, ProductOrServiceController.deleteProduct);

module.exports = router;