const pool = require("../services/db");

// Insert new challenge
module.exports.insertChallenge = (data, callback) => {
    const SQLSTATEMENT = `INSERT FitnessChallenge (creator_id, challenge, skillpoints) VALUES (?,?,?);`;
    const VALUES = [data.creator_id, data.challenge, data.skillpoints];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Get all challenges with creator's username
module.exports.selectAllChallenges = (callback) => {
    const SQLSTATEMENT = `
        SELECT 
            FitnessChallenge.challenge_id, 
            FitnessChallenge.challenge, 
            FitnessChallenge.creator_id, 
            FitnessChallenge.skillpoints, 
            User.username 
        FROM FitnessChallenge
        JOIN User ON FitnessChallenge.creator_id = User.user_id;
    `;
    pool.query(SQLSTATEMENT, callback);
};

// Get challenge from a specific id
module.exports.selectChallengeById = (data, callback) => {
    const SQLSTATEMENT = `SELECT * FROM FitnessChallenge WHERE challenge_id = ?;`;
    const VALUES = [data.challenge_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Update challenge details from specific id
module.exports.updateChallengeById = (data, callback) => {
    const SQLSTATEMENT = `UPDATE FitnessChallenge SET challenge = ?, skillpoints = ? WHERE challenge_id = ?;`;
    const VALUES = [data.challenge, data.skillpoints, data.challenge_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Delete specific challenge
module.exports.deleteChallengeById = (data, callback) => {
    const SQLSTATEMENT = `DELETE FROM FitnessChallenge WHERE challenge_id = ?;`;
    const VALUES = [data.challenge_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Challenge Completion
// Get a user from their id
module.exports.selectUserByUserId = (data, callback) => {
    const SQLSTATEMENT = `SELECT * FROM User WHERE user_id = ?;`;
    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}
// Insert a challenge a user has completed into UserCompletion Table
module.exports.insertUserCompletion = (data, callback) => {
    const SQLSTATEMENT = `INSERT UserCompletion (challenge_id, user_id, completed, creation_date, notes) VALUES (?,?,?,?,?) ;`;
    const VALUES = [data.challenge_id, data.user_id, data.completed, data.creation_date, data.notes];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Get all users who completed the challenge
module.exports.selectAllUserCompletionByChallengeId = (data, callback) => {
    const SQLSTATEMENT = `        
        SELECT 
            uc.user_id, 
            u.username, 
            MAX(CASE WHEN uc.completed = 1 THEN true ELSE false END) AS completed, 
            DATE(uc.creation_date) AS creation_date, 
            GROUP_CONCAT(uc.notes SEPARATOR ' | ') AS notes
        FROM UserCompletion uc
        JOIN User u ON uc.user_id = u.user_id
        WHERE uc.challenge_id = ?
        GROUP BY uc.user_id, u.username, creation_date;`;

    const VALUES = [data.challenge_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};


// Update Skillpoints
module.exports.updateSkillpointsByUserId = (data, callback) => {
    const skillpointsToAdd = data.completed === false ? 5 : data.skillpoints;
    const SQLSTATEMENT = `UPDATE User SET skillpoints = skillpoints + ? WHERE user_id = ?;`;
    const VALUES = [skillpointsToAdd, data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}