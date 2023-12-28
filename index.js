const express = require('express');
const app = express();
const port = 3000;
const dao = require('./DAO');

const MongoClient = require('mongodb').MongoClient


MongoClient.connect('mongodb://127.0.0.1:27017')
.then((client) => {
    db = client.db('proj2023MongoDB')
    coll = db.collection('managers')
})
.catch((error) => {
    console.log(error.message)
})

//register view engine
app.set('view engine', 'ejs');

//link to Main Page
app.get('/', (req, res) => {
    res.render('mainpage',{title: 'Main Page'});
});

//link to Stores Page
app.get('/stores', (req, res) => {
    res.render('stores', { title: 'Stores' });
});

//link to Products Page
app.get('/products', (req, res) => {
    res.render('products', { title: 'Products' });
});

//link to Managers Page
// app.get('/managers', (req, res) => {
//     res.render('managers', { title: 'Managers' });
// });

//link to managers page and also getting the data from the collection
app.get('/managers', (req, res) => {
    dao.findAll(coll)
    .then((response) => {
        // Process response
        console.log("response", response);
        res.render('managers', { title: 'Managers', 'managers': response, 'error': ''});
    })
    .catch((error) => {
        // Handle error
        console.error(error);
        res.render('managers', { title: 'Managers', 'managers': [], 'error': error});
    })
})

//listen for requests coming in
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});