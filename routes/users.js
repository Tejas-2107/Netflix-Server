const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const verify = require('../verifyToken');

//update
router.put("/:id", verify, async (req, res) => {
    console.log(req.user.id);
    if (req.user.id === req.params.id || req.user.isAdmin) {
        if (req.body.password) {
            req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString();
        }
        try {
            const updateUser = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            },
                { new: true });
            res.status(200).json(updateUser);
        } catch (error) {
            res.status(500).json(error);
        }
    }
    else {
        res.status(403).json("You can update your account");
    }
});

//delete
router.delete("/:id", verify, async (req, res) => {
    if (req.user.id === req.params.id || req.user.isAdmin) {

        try {
            await User.findByIdAndDelete(req.params.id, {
                $set: req.body
            },
                { new: true });
            res.status(200).json("User has been deleted");
        } catch (error) {
            res.status(500).json(error);
        }
    }
    else {
        res.status(403).json("You can delete your own account");
    }
});

//get
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
})

//getall
router.get("/", verify, async (req, res) => {
    const query = req.query.new;
    if (req.user.isAdmin) {
        try {
            const users = query ? await User.find().sort({ _id: -1 }).limit(10) : await User.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json(error);
        }
    }

})

//get userstats
router.get("/stats", async (req, res) => {
    const today = new Date();
    const latYear = today.setFullYear(today.setFullYear() - 1);
  
    try {
      const data = await User.aggregate([
        {
          $project: {
            month: { $month: "$createdAt" },
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 },
          },
        },
      ]);
      res.status(200).json(data)
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;