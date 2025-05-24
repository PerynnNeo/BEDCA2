const express = require('express');
const router = express.Router();

const controller = require('../controllers/reviewController');
const jwtController = require('../middlewares/jwtMiddleware');

// -- Get all reviews
router.get('/',
    controller.readAllReview
);

// -- Create a review for a challenge
router.post('/challenges/:challenge_id',
    jwtController.verifyToken,
    controller.checkReviewandChallengeCompletionExists,
    controller.createReview
);

// -- Get all reviews by challenge ID      
router.get('/challenges/:challenge_id',
    controller.readReviewById
);

// -- Update a review by review ID
router.put('/:review_id',
    jwtController.verifyToken,
    controller.updateReviewById
);

// -- Delete a review by review ID
router.delete('/:review_id',
    jwtController.verifyToken,
    controller.deleteReviewById
);

module.exports = router;
