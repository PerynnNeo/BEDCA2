const pool = require('../services/db');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
        SELECT 
            r.*,
            u.username
        FROM Reviews AS r
        INNER JOIN User AS u
            ON r.user_id = u.user_id
        
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
        SELECT 
            r.*,
            u.username
        FROM Reviews AS r
        INNER JOIN User AS u
            ON r.user_id = u.user_id
        WHERE challenge_id = ?;
    `;
    const VALUES = [data.id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.insertSingle = (data, callback) =>
{
    const SQLSTATMENT = `
    INSERT INTO Reviews (review_amt, user_id, challenge_id, reason)
    VALUES (?, ?,?,?);
    `;
    const VALUES = [data.review_amt, data.user_id, data.challenge_id, data.reason];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.checkUserCompletionAndReview = (userId, challengeId, callback) => {
    const SQLSTATEMENT = `
    SELECT 
        EXISTS (SELECT 1 FROM UserCompletion WHERE user_id = ? AND challenge_id = ?) AS completed,
        EXISTS (SELECT 1 FROM Reviews WHERE user_id = ? AND challenge_id = ?) AS reviewExists;
    `;
    const VALUES = [userId, challengeId, userId, challengeId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.updateById = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE Reviews 
        SET review_amt = ?, reason = ?
        WHERE id = ? AND user_id = ?;
    `;  
    const VALUES = [data.review_amt, data.reason, data.id, data.user_id]; // Ensure correct order

    pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.deleteById = (data, callback) =>
{
    const SQLSTATMENT = `
    DELETE FROM Reviews 
    WHERE id = ?;
    `;
    const VALUES = [data.id];

    pool.query(SQLSTATMENT, VALUES, callback);
}