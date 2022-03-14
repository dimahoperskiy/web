var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const mongoose = require("mongoose");
const Post = require("./Post")
require('dotenv/config')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

mongoose.connect(process.env.DB_CONNECTION, () => {
    console.log('connected')
})

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get('/find', (req, res) => {
    res.sendFile(__dirname + "/client.html")
})

app.get('/scoring', (req, res) => {
    const scoring = req.query.scoring

    if (scoring < 1.5) {
        res.send('Кредит не одобрен, ваш рейтинг: ' + scoring)
    } else {
        res.send('Кредит одобрен, ваш рейтинг: ' + scoring)
    }
})

app.post('/', (req, res) => {
    const post = new Post({
        ...req.body
    })

    let scoring = 0

    const years = Math.floor((new Date() - new Date(req.body.dateOfBirth)) / 1000 / 60 / 60 / 24 / 365)

    if ((years > 60) || (years < 18)) {
        scoring -= 9999
    } else if (years > 22) {
        scoring += 0.3;
    } else if (years > 20) {
        scoring += (years-20)*0.1;
    }

    if (req.body.gender === "F") {
        scoring += 0.4;
    }

    if (req.body.yearsInRegion > 9) {
        scoring += 0.42;
    } else {
        scoring += (0.042 * req.body.yearsInRegion);
    }

    if (req.body.profession === "devTeacher") {
        scoring += 0.55;
    }
    else if (req.body.profession === "driverPolicemanPilot") {
        scoring += 0.16;
    }

    if (req.body.workingForGovernment) {
        scoring += 0.21;
    }

    scoring += 0.059*req.body.jobYears

    if (req.body.hasBankAccount) {
        scoring += 0.45;
    }
    if (req.body.hasRealEstate) {
        scoring += 0.35;
    }
    if (req.body.hasInsurance) {
        scoring += 0.19;
    }


    post.save()
        .then(data => {
            if (scoring < 1.5) {
                res.send({text: 'Кредит не одобрен, ваш рейтинг: ' +scoring})
            } else {
                res.send({text: 'Кредит одобрен, ваш рейтинг: ' + scoring})
            }
        })
        .catch(err => {
            res.json({message: err})
        })
})

app.get('/client/:email', async (req, res) => {
    const email = req.params.email

    const client = await Post.findOne({email}).exec()
    console.log(email)
    console.log(client)

    res.send({client})
})


app.listen(8080)

module.exports = app;