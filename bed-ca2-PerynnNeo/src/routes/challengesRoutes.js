const express = require('express');
const router = express.Router();
const controller = require('../controllers/challengesController');
const jwtController = require('../middlewares/jwtMiddleware');

// Create a new challenge POST /challenges || Body params: challenge, user_id, skillpoints
router.post('/', 
    jwtController.verifyToken,              // Ensure the user is authenticated
    controller.postNewChallenge
);

// Retrieve all challenges in the database GET /challenges
router.get('/', 
    controller.getAllChallenges
);

// Update challenge details PUT /challenges/:challenge_id || Body params: user_id, challenge, skillpoints
router.put('/:challenge_id', 
    jwtController.verifyToken,              // Ensure the user is authenticated
    controller.checkCreatorId, 
    controller.changeChallengeById
);

// Delete a challenge DELETE /challenges/:challenge_id
router.delete('/:challenge_id', 
    jwtController.verifyToken,              // Ensure the user is authenticated
    controller.checkCreatorId, 
    controller.deleteChallengeById
);

// Complete a challenge POST /challenges/:challenge_id || Body params: user_id, completed, creation_date, notes
router.post('/:challenge_id', 
    jwtController.verifyToken,              // Ensure the user is authenticated
    controller.checkChallengeId, 
    controller.checkUserId, 
    controller.postCompletedChallenge, 
    controller.updateUserSkillpoints
);

// Retrieve all users who completed a specific challenge GET /challenges/:challenge_id
router.get('/:challenge_id', 
    controller.getAllUsersForChallenge
);

module.exports = router;