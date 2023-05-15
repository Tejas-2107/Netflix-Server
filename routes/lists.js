const router = require('express').Router();
const List = require('../models/List');
const verify = require('../verifyToken');

//create a movie
router.post("/", verify, async (req, res) => {
    if (req.user.isAdmin) {
        const newList = new List(req.body);
        try {
            const savedList = await newList.save();
            res.status(200).json(savedMovie)
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        res.status(403).json("You are not allowed!");
    }
})


//delete a list
router.delete("/:id", verify, async (req, res) => {
    if (req.user.isAdmin) {
        try {
            await List.findByIdAndDelete(req.params.id);
            res.status(200).json("List has been Deleted");
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        res.status(403).json("You are not allowed!");
    }
})

//get
router.get("/", verify, async (req, res) => {
    console.log("yes working");
    const type = req.query.type;
    const genreQuery = req.query.genre;
    // const type = false,genreQuery = false;
    let list = [];
    try {
        if (type) {
            if (genreQuery) {
                list = await List.aggregate([
                    { $sample: { size: 10 } },
                    { $match: { type: type, genre: genreQuery } }
                ])
            }
            else {
                list = await List.aggregate([
                    { $sample: { size: 10 } },
                    { $match: { type: type } }
                ])
            }
        }
        else {
            list = await List.aggregate([{
                $sample: { size: 10 }
            }])
        }
        res.status(200).json(list);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})
module.exports = router;