const model = require("../models/reviewModel.js");

module.exports.createReview = (req, res, next) => {
    if(req.body.review_amt === undefined) {
        return res.status(400).send("Error: review_amt is undefined");
    }
    if(req.body.review_amt > 5 || req.body.review_amt < 1) {
        return res.status(400).send("Error: review_amt can only be between 1 to 5");
    }
    if(res.locals.userId === undefined) {
        return res.status(400).send("Error: user_id is undefined");
    }

    const data = {
        user_id: res.locals.userId,
        review_amt: req.body.review_amt,
        challenge_id: req.params.challenge_id,
        reason: req.body.reason
    };

    console.log("data", data);

    model.insertSingle(data, (error, results) => {
        if (error) {
            console.error("Error creating review:", error);
            return res.status(500).json(error);
        }
        res.status(201).json(results);
    });
}

module.exports.checkReviewandChallengeCompletionExists = (req, res, next) => {
    const userId = res.locals.userId;
    const challengeId = req.params.challenge_id;

    model.checkUserCompletionAndReview(userId, challengeId, (error, results) => {
        if (error) {
            console.error("Error checking challenge completion and review:", error);
            return res.status(500).json({ error: "Database error" });
        }

        const { completed, reviewExists } = results[0] || {};

        if (!completed) {
            return res.status(400).json({ error: "User has not completed this challenge and cannot submit a review" });
        }
        if (reviewExists) {
            return res.status(400).json({ error: "User has already submitted a review for this challenge" });
        }

        next();
    });
};

module.exports.readReviewById = (req, res, next) => {
    const data = {
        id: req.params.challenge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readReviewById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "Review not found"
                });
            }
            else res.status(200).json(results);
        }
    }

    model.selectById(data, callback);
}

module.exports.readAllReview = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllReview:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    }

    model.selectAll(callback);
}

module.exports.updateReviewById = (req, res, next) => {
    if (req.params.review_id == undefined) // Fix this line
    {
        res.status(400).send("Error: review_id is undefined");
        return;
    }
    else if (req.body.review_amt == undefined)
    {
        res.status(400).send("Error: review_amt is undefined");
        return;
    }
    else if (req.body.review_amt > 5 || req.body.review_amt < 1)
    {
        res.status(400).send("Error: review_amt can only be between 1 to 5");
        return;
    }
    else if (res.locals.userId == undefined)
    {
        res.status(400).send("Error: user_id is undefined");
        return;
    }

    const data = {
        id: req.params.review_id, // Ensure this matches the route
        user_id: res.locals.userId,
        review_amt: req.body.review_amt,
        reason: req.body.reason
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateReviewById:", error);
            res.status(500).json(error);
        } else {
            res.status(204).send();
        }
    }

    model.updateById(data, callback);
};


module.exports.deleteReviewById = (req, res, next) => {
    const data = {
        id: req.params.review_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleteReviewById:", error);
            res.status(500).json(error);
        } else {
            if(results.affectedRows == 0) 
            {
                res.status(404).json({
                    message: "Review not found"
                });
            }
            else
            {
                res.status(204).send();
            }
        }
    }

    model.deleteById(data, callback);
}