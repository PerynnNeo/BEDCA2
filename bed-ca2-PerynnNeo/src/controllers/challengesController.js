const model = require("../models/challengesModel");
// Insert new challenge into database
module.exports.postNewChallenge = (req, res, next) => {
    if (req.body.challenge == undefined || req.body.user_id == undefined || req.body.skillpoints == undefined ) {
        return res.status(400).json({message: 'There are missing values in your body'});
    }
    const data = {
        challenge: req.body.challenge,
        creator_id: res.locals.userId,
        skillpoints: req.body.skillpoints 
    }
    if (data.skillpoints < 1 || data.skillpoints > 200 ) {
        return res.status(400).json({message: 'Invalid value in skillpoints'});
    }
    const callback = (error, results) => {
        if (error) {
            console.error('Error postNewChallenge', error);
            return res.status(500).json(error);
        } else {
            return res.status(201).json({challenge_id: results.insertId, challenge: data.challenge, creator_id: data.creator_id, skillpoints: data.skillpoints});
        }
    }
    model.insertChallenge(data, callback);
}
// Retrieve all available challenges
module.exports.getAllChallenges = (req, res) => {
    const callback = (error, results) => {
        if (error) {
            console.error('Error getAllChallenges', error);
            return res.status(500).json(error);
        } else {
            return res.status(200).json(results);
        }
    }
    model.selectAllChallenges(callback);
}
// check if the user modifying the challenge is the creator
module.exports.checkCreatorId = (req, res, next) => {
    const data = {
        challenge_id: req.params.challenge_id,
        creator_id: res.locals.userId,
        challenge: req.body.challenge,
        skillpoints: req.body.skillpoints
    }
    const callback = (error, results) => {
        if (error) {
            console.error('Error checkCreatorId', error);
            return res.status(500).json(error);
        } else if (results.length == 0) {
            return res.status(404).json({message: 'Challenge not found'});
        } else if (data.creator_id !== results[0].creator_id) {
            return res.status(403).json({message: 'The user is not the correct creator for the challenge'});
        }  else {
            next();
        }
    }
    model.selectChallengeById(data, callback);
}
// Change challenge details
module.exports.changeChallengeById = (req, res) => {
    if (req.body.challenge == undefined || req.body.user_id == undefined || req.body.skillpoints == undefined ) {
        return res.status(400).json({message: 'There are missing values'});
    }
    const data = {
        challenge_id: req.params.challenge_id,
        creator_id: res.locals.userId,
        challenge: req.body.challenge,
        skillpoints: req.body.skillpoints
    }
    const callback = (error, results) => {
        if (error) {
            console.error('Error changeChallengeById', error);
            return res.status(500).json(error);
        } else {
            return res.status(200).json({challenge_id: req.params.challenge_id, challenge: data.challenge, creator_id: data.creator_id, skillpoints: data.skillpoints});
        }
    }
    model.updateChallengeById(data, callback);
}
// Delete a specific challenge for user
module.exports.deleteChallengeById = (req, res) => {
    const data ={
        challenge_id: req.params.challenge_id
    }
    const callback = (error, results) => {
        if (error) {
            console.error('Error deleteChallengeById', error);
            return res.status(500).json(error);
        } else if (results.affectedRows == 0) {
            return res.status(404).json({message: 'Challenge not found'});
        } else {
            return res.status(204).send()
        }
    }
    model.deleteChallengeById(data, callback);
}

// Challenge Completion
// Check if challenge exists
module.exports.checkChallengeId = (req, res, next) => {
    const data = {
        challenge_id: req.params.challenge_id
    }
    const callback = (error, results) => {
        if (error) {
            console.error('Error checkCreatorId', error);
            return res.status(500).json(error);
        } else if (results.length == 0) {
            return res.status(404).json({message: 'Challenge not found'});
        } else {
            req.skillpoints = results[0].skillpoints;
            next();
        }
    }
    model.selectChallengeById(data, callback);
}
// Check if user exists
module.exports.checkUserId = (req, res, next) => {
    const data = {
        user_id: req.body.user_id
    }
    const callback = (error, results) => {
        if (error) {
            console.error('Error checkUserId', error);
            return res.status(500).json(error);
        } else if (results.length == 0) {
            return res.status(404).json({message: 'User not found'});
        } else {
            next();
        }
    }
    model.selectUserByUserId(data, callback);
}
// User complete challenge
module.exports.postCompletedChallenge = (req, res, next) => {
    if (req.body.completed == undefined || req.body.user_id == undefined || req.body.creation_date == undefined || req.body.notes == undefined ) {
        return res.status(400).json({message: 'There are missing values'});
    }
    const data = {
        challenge_id: req.params.challenge_id,
        user_id: res.locals.userId,
        completed: req.body.completed,
        creation_date: req.body.creation_date,
        notes: req.body.notes
    }
    const callback = (error, results) => {
        if (error) {
            console.error('Error postCompletedChallenge', error);
            return res.status(500).json(error);
        } else if (results.affectedRows == 0) {
            return res.status(404).json({message: 'Challenge not found'});
        } else {
            req.completed_id = results.insertId;
            next();
        }
    }
    model.insertUserCompletion(data, callback);
}
// Retrieve all users that completed the specific challenge
module.exports.getAllUsersForChallenge = (req, res) => {
    const data = {
        challenge_id: req.params.challenge_id
    }
    const callback = (error, results) => {
        if (error) {
            console.error('Error getAllAttemptedChallenges', error);
            return res.status(500).json(error);
        } else if (results.length == 0) {
            return res.status(404).json({message: 'Challenge has not been attempted'})
        } else {
            return res.status(200).json(results);
        }
    }
    model.selectAllUserCompletionByChallengeId(data, callback);
}

// After completing the challenge, give the required skillpoints to user
module.exports.updateUserSkillpoints = (req, res) => {
    const data = {
        skillpoints: req.skillpoints,
        completed: req.body.completed,
        user_id: res.locals.userId
    }
    const callback = (error, results) => {
        if (error) {
            console.error('Error updateUserSkillpoints', error);
            return res.status(500).json(error);
        } else {
            return res.status(201).json({
                complete_id: req.completed_id,
                challenge_id: req.params.challenge_id,
                user_id: data.user_id,
                completed: req.body.completed,
                creation_date: req.body.creation_date,
                notes: req.body.notes});
        }
    }
    model.updateSkillpointsByUserId(data, callback);
}