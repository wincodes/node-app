const express = require('express');
const router = new express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//require the model
let User = require('../models/user');

//Register Form
router.get('/register', function(req, res){
    res.render('register');
});

//register the user
router.post('/register', function(req, res){
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password
    const password2 = req.body.password2;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('password2', 'password must be the same').equals(req.body.password);

    let errors = req.validationErrors();

    if(errors){
        res.render('register', {
            errors:errors
        });
    }else{
        let newUser = new User({
            name:name,
            email:email,
            username:username,
            password:password
        });

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newUser.password, salt, function(err, hash){
                if (err){
                    console.log(err);
                }

                newUser.password = hash;

                newUser.save(function(err){
                    if(err){
                        console.log(err);
                        return;
                    }else{
                        req.flash('success', 'Registration Successful, you can now log in');
                        res.redirect('/user/login');
                    }
                });
            })
        });
    }

});

//Login Form
router.get('/login', function(req, res,){
    res.render('login');
});

//post the login
router.post('/login', function(req, res, next){
        passport.authenticate('local', { 
            successRedirect: '/',
            failureRedirect: '/user/login',
            failureFlash: true
    })(req, res, next);    
});

//post the login
router.get('/logout', function(req, res){
   req.logout();
   req.flash('success', 'You are now logged out');
   res.redirect('/user/login');
});


module.exports = router;