'use strict';

const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const app = express();

// Please enter the correct connection string for accessing MongoDB cluser
const MONGODB_URI = "";
mongoose.connect(MONGODB_URI || 'mongodb://localhost/urlShortener', {
    useNewUrlParser: true, useUnifiedTopology: true
})

mongoose.connection.on('connected', () => {
    console.log('Mongoose successfully connected');
});

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.json( { limit: '1mb'}));
app.get('/', async (req, res) => {
    const shortUrls = await ShortUrl.find();
    res.render('index', { shortUrls: shortUrls });
})

app.post('/shortUrls', (req, res) => {
    ShortUrl.findOne({ full: req.body.fullUrl }, function (err, result){
        if(result) {
            res.json(result.short);
        }
        else {
            ShortUrl.create({ full: req.body.fullUrl }, (err, result) => {
                res.json(result.short);
            });
        }
    });
});

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (shortUrl == null) return res.sendStatus(404);
    shortUrl.clicks++;
    shortUrl.save();
    res.redirect(shortUrl.full);
});

app.listen(process.env.PORT || 3000);