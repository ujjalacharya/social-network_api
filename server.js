const express = require('express');
const app = express();
const mongoose = require('mongoose')
const db = require('./config/keys');
const PORT = process.env.PORT || 5000;

mongoose
    .connect(db.mongoURI, { useNewUrlParser: true })
    .then(() => { console.log('Successfully connected to the database') })
    .catch(err => console.log(err))

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`)
})