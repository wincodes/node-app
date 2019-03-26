const express = require('express');
const router = new express.Router();

//require the article model
let Article = require('../models/article');

//require user the model
let User = require('../models/user');


//add article route
router.get('/add', ensureAuthenticated, function(req, res){
    res.render('add_articles', {
        input: 'Add articles'
    });
});

//route to post the article added
router.post('/add', ensureAuthenticated, function(req, res){
    req.checkBody('title', 'Title is required').notEmpty();
    // req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    let errors = req.validationErrors();

    if(errors){
        res.render('add_articles', {
            input: 'Add Articles',
            errors:errors
        });
    }else{

        let articles = new Article();
        articles.title = req.body.title;
        articles.author = req.user._id;
        articles.body = req.body.body;
    
        articles.save(function(err){
            if(err){
                console.log(err);
                return;
            }else{
                req.flash('success', 'Article saved');
                res.redirect('/');
            }
        });

    }
});

//view a particular article route
router.get('/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
    User.findById(article.author, function(err, user){
        res.render('article', {
            article:article,
            author: user.name
        });
    });
    });
});


function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('danger', 'please login to access that page');
        res.redirect('/user/login');
    }
}


//edit a particular article route
router.get('/edit/:id', ensureAuthenticated, function(req, res, next){
    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            req.flash('danger', 'Not authorized');
            res.redirect('/');
            return next();
        }
        res.render('edit_article', {
            input: 'Edit Articles',
            article:article
        });
    });
});

//route to save the article edited
router.post('/edit/:id', function(req, res){
    let articles = {};
    articles.title = req.body.title;
    articles.author = req.body.author;
    articles.body = req.body.body;

    let query = {_id:req.params.id}

    Article.update(query, articles, function(err){
        if(err){
            console.log(err);
            return;
        }else{
            req.flash('success', 'Article Edited');
            res.redirect('/');
        }
    });
});

//delete the article
router.delete('/:id', function(req, res){

    if(!req.user._id){
        res.status(500).send();
    }

    let query = {_id:req.params.id}

    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            res.status(500).send();
        }else{
            Article.remove(query, function(err){
                if(err){
                console.log(err);
                }
                res.send('success');
            });
        }
    });
});

module.exports = router;