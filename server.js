var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/mongoose_dashboard');
var TurtleSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 2, maxlength: 256},
    color: {type: String, required: true, minlength: 2, maxlength: 256}
}, {timestamps: true});
mongoose.model('Turtle', TurtleSchema);
var Turtle = mongoose.model('Turtle');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    Turtle.find({}).sort('-createdAt').exec(function(err, turtles) {
        res.render('index', {turtles: turtles});
    });
});

app.get('/turtles/new', function(req, res) {
    res.render('new', {prefill: {name: '', color: ''}})
});

app.post('/turtles', function(req, res) {
    var turtle = new Turtle({name: req.body.name, color: req.body.color});
    turtle.save(function(err) {
        if (err) {
            res.render('new', {errors: turtle.errors, prefill: {name: req.body.name, color: req.body.color}});
        } else {
            res.redirect('/');
        }
    });
});

app.get('/turtles/:id', function(req, res) {
    Turtle.findOne({_id: req.params.id}, function(err, turtle) {
        if (!turtle) {
            res.redirect('/');
        }
        res.render('turtle', {turtle: turtle});
    });
});

app.post('/turtles/:id', function(req, res) {
    Turtle.findOne({_id: req.params.id}, function(err, turtle) {
        if (!turtle) {
            res.redirect('/');
        }
        turtle.name = req.body.name;
        turtle.color = req.body.color;
        turtle.save(function(err) {
            if (err) {
                res.render('edit', {errors: turtle.errors, turtle: turtle});
            } else {
                res.redirect('/turtles/' + turtle._id);
            }
        });
    });
});

app.get('/turtles/edit/:id', function(req, res) {
    Turtle.findOne({_id: req.params.id}, function(err, turtle) {
        if (!turtle) {
            res.redirect('/');
        }
        res.render('edit', {turtle: turtle});
    });
});

app.post('/turtles/destroy/:id', function(req, res) {
    Turtle.remove({_id: req.params.id}, function(err) {
        res.redirect('/');
    });
});

app.listen(8000, function() {
    console.log("listening on port 8000");
});