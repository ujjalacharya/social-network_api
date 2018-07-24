const express    = require('express');
const app        = express();
const mongoose   = require('mongoose')
const db         = require('./config/keys');
const bodyParser = require('body-parser')
const passport   = require('passport');
const PORT       = process.env.PORT || 5000;

//Import routes
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

//Database connection
mongoose
    .connect(db.mongoURI, { useNewUrlParser: true })
    .then(() => { console.log('Successfully connected to the database') })
    .catch(err => console.log(err))

//BodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Passport middleware
app.use(passport.initialize());
require('./config/passport')(passport);

//Routes middleware
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

//Server start
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`)
})