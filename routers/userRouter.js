const express = require('express');
const { User } = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



// get method
router.get('/', async (req, res) => {
    const userList = await User.find().select('name email phone passwordHash');

    if(!userList){
        res.status(500).json({success: false})
    }
    res.send(userList);
});

// post method
router.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,

    })

     user = await user.save();
     if(!user){
        return res.status(404).send('The User cannot be crated')
     }

     res.send(user);
   
});

// get single user
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('name email phone');

    if(!user){
        res.status(500).json({message: 'The User with given ID does not'});
    }
    res.send(user);
});

// update user profile
router.put('/:id', async(req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        {new: true}
    )
    if(!user)
      return res.status(404).send('The user with this ID is not found.');

      res.send(user);
});

// Delete the user
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user){
            return res.status(200).json({
                success: true,
                message: 'The user was removed successfully.'
            })
        }else{
            return res.status(404).json({success: false, message: 'The user could not be found.'});
        }
    }).catch(err =>{
        return res.status(500).json({success: false, message: err});
    });
});

// Login User
router.post('/login', async(req, res) => {
    const user = await User.findOne({email: req.body.email});
    const secret = process.env.secret;
    if(!user){
        return res.status(404).send('The user does not exist')
    }
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1d'}
        )
        res.status(200).send({user: user.email, token: token});
    }else{
        res.status(400).send('password is incorrect')
    }
    
});

// User Count
router.get('/get/count', async (req, res) => {
    const userCount = await User.countDocuments();

    if(!userCount){
        res.status(500).json({success: false})
    }
    res.send({
        userCount: userCount
    });
});


module.exports = router;