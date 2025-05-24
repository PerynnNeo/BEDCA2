const model = require("../models/usersModel");

module.exports.checkNew = (req, res, next) => {
    if (req.body.username == undefined) {
        return res.status(400).json({message: 'Username is missing'})
    }
    const data = {
        username: req.body.username
    }
    const callback = (error, results) => {
        if (error) {
            console.error('Error checkNew', error);
            return res.status(500).json(error);
        } else if (results.length !== 0) {
            return res.status(409).json({message: 'The provided username is already associated with another user'});
        } else {
            next();
        }
    }
    model.selectByName(data, callback)
}

module.exports.createUser = (req, res, next) => {
    const data = {
        username: req.body.username,
        email: req.body.email,
        password: res.locals.hash
    };
    const callback = (error, results) => {
        if (error) {
            console.error('Error createUser', error);
            return res.status(500).json(error);
        } else {
            return res.status(201).json({user_id: results.insertId, username: req.body.username, skillpoints: 0})
        }

    }
    model.insertNewUser(data, callback);
}

module.exports.getAllUsers = (req, res) => {
    const callback = (error, results) => {
        if (error) {
            console.error('Error getAllUsers', error);
            return res.status(500).json(error);
        } else {
            return res.status(200).json(results);
        }
    }
    model.selectAllUsers(callback);
}

module.exports.checkOtherUsers = (req, res, next) => {
    if (req.body.username == undefined) {
        return res.status(400).json({message: 'Username is missing'})
    }
    const data = {
        user_id: res.locals.userId,
        username: req.body.username
    }
    const callback = (error, results) => {
        if (error) {
            console.error('Error checkOtherUsers', error);
            return res.status(500).json(error);
        } else if (results.length !== 0) {
            return res.status(409).json({message: 'The provided username is already associated with another user'});
        } else {
            next();
        }
    }
    model.selectByNameByOtherId(data, callback)
}
module.exports.changeDetailsByUserId = (req, res) => {
    if (req.body.username == undefined || req.body.skillpoints == undefined) {
        return res.status(400).json({message: 'Username/skillpoints is missing'})
    }
    const data = {
        user_id: res.locals.userId,
        username: req.body.username,
        skillpoints: req.body.skillpoints,
        description: req.body.description
    }
    const callback = (error, results) => {
        if (error) {
            console.error('Error changeDetailsByUserId', error);
            return res.status(500).json(error);
        } else if (results.affectedRows == 0) {
            return res.status(404).json({message: 'User not found'});
        } else {
            return res.status(200).json({user_id: req.params.user_id, username: req.body.username, skillpoints: req.body.skillpoints})
        }
    }
    model.updateUserDetailsById(data, callback);
}


////////////////////////////////////////////////////////////////////////////
// Section B      
////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////
// User Validation and Management
////////////////////////////////////////////////////////////////////////////

// 1. Check if a user exists by their ID.
module.exports.checkUserExists = (req, res, next) => {
    const data = {
        userId: res.locals.userId
    };
  
    const callback = (error, results) => {
      if (error) {
        console.error('Error checking user existence:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      next();
    };
    model.checkUserExists(data, callback)
};


// (A) For `/me/progress`
module.exports.getMyScore = (req, res) => {
    // Because verifyToken sets res.locals.userId
    const userId = res.locals.userId;
    const onlyMoney = req.query.onlyMoney === "true";
  
    model.getUserProgress(userId, (error, results) => {
      if (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      if (onlyMoney) {
        return res.status(200).json({ money: results[0].money });
      }
      
      // Return the user’s progress
      const userProgress = {
        skillpoints: results[0].skillpoints,
        money: results[0].money,
        total_money_earned: results[0].total_money_earned,
        recipes_unlocked: results[0].recipes_unlocked,
        challenges_completed: results[0].challenges_completed,
        description: results[0].description,
        username: results[0].username,
        user_id: results[0].user_id
      };
      return res.status(200).json(userProgress);
    });
  };
  
  // (B) For `/users/:userId/progress`
  module.exports.getUserScore = (req, res) => {
    // We get the target user ID from the URL param
    const userId = req.params.userId;
  
    model.getUserProgress(userId, (error, results) => {
      if (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Return that user’s progress
      const userProgress = {
        skillpoints: results[0].skillpoints,
        money: results[0].money,
        total_money_earned: results[0].total_money_earned,
        recipes_unlocked: results[0].recipes_unlocked,
        challenges_completed: results[0].challenges_completed,
        description: results[0].description,
        username: results[0].username,
        user_id: results[0].user_id
      };
      return res.status(200).json(userProgress);
    });
  };
////////////////////////////////////////////////////////////////////////////
// User Inventory
////////////////////////////////////////////////////////////////////////////


 // 1. Get the user's inventory of foods and their quantities.

module.exports.getUserInventory = (req, res) => {
    const userId = res.locals.userId;

    // Call the model to fetch inventory data
    model.getUserInventory(userId, (error, results) => {
        if (error) {
            console.error('Error fetching user inventory:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No inventory found for the user' });
        }

        // Format the response
        return res.status(200).json({
            user_id: userId,
            inventory: results.map(item => ({
                food_id: item.food_id,
                recipe_id: item.recipe_id,
                food_name: item.food_name,
                quantity: item.quantity,
                money_gain: item.money_gain,
                skillpoints_gain: item.skillpoints_gain,
                description: item.description
            }))
        });
    });
};


////////////////////////////////////////////////////////////////////////////
// CA2 Authorisation     
////////////////////////////////////////////////////////////////////////////  
   

//////////////////////////////////////////////////////
// CONTROLLER FOR REGISTER
//////////////////////////////////////////////////////
module.exports.register = (req, res, next) => {
    const data = {
        username: req.body.username,
        email: req.body.email,
        password: res.locals.hash
    };
    if (!data.username || !data.email || !data.password) {
        return res.status(400).json({message: 'username, email or password is undefined'});
    }


    const callback = (error, results) => {
        if (error) {
            console.error('Error register', error);
            return res.status(500).json(error);
        } else {
            res.locals.userId = results.insertId
            res.locals.message = `User ${data.username} created successfully.`
            next();
        }
    }
    model.insertNewUser(data, callback);
}


//////////////////////////////////////////////////////
// CONTROLLER FOR LOGIN
//////////////////////////////////////////////////////
module.exports.login = (req, res, next) => {
    const data = {
        username: req.body.username,
        password: req.body.password
    }
    if (!data.username || !data.password) {
        return res.status(400).json({message: 'Username or password is undefined'});
    }
    const callback = (error, results) => {
        if (error) {
            console.error('Error login', error);
            return res.status(500).json(error);
        } else if (results.length === 0) {
            return res.status(404).json({message: 'User not found'})
        } else {
            res.locals.userId = results[0].user_id;
            res.locals.hash = results[0].password;
            res.locals.username = results[0].username;
            res.locals.message = 'Token is verified.'
            next();
        }
    }
    model.selectByName(data, callback);
}

//////////////////////////////////////////////////////
// MIDDLEWARE FOR CHECK IF USERNAME OR EMAIL EXISTS
//////////////////////////////////////////////////////
module.exports.checkUsernameOrEmailExist = (req, res, next) => {
    const data = {
        username: req.body.username,
        email: req.body.email
    }

    const callback = (error, results) => {
        if (error) {
            console.error('Error checkUsernameOrEmailExist', error);
            return res.status(500).json(error);
        } else if (results.length > 0) {
            return res.status(409).json({message: 'Username or email already exists'});
        } else {
            next();
        }
    }
    model.getUserbyUsernameOrEmail(data, callback);
}