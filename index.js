const express = require('express');
const app = express();
const port = 3000;
const dao = require('./DAO');

//register view engine
app.set('view engine', 'ejs');

//connecting to the mongo database
const MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://127.0.0.1:27017')
.then((client) => {
    db = client.db('proj2023MongoDB')
    coll = db.collection('managers')
})
.catch((error) => {
    console.log(error.message)
})

//connecting to the sql database
const pmysql = require('mysql2');

const pool = pmysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'proj2023'
});
    // .then(p => {
    //     pool = p
    // })
    // .catch(e => {
    //     console.log("pool error:" + e)
    // })

pool.query('SELECT * FROM `product`', function (error, results, fields) {
    if (error) throw error;
    console.log('response', results);
});


//link to Main Page
app.get('/', (req, res) => {
    res.render('mainpage',{title: 'Main Page'});
});

//link to Stores Page
app.get('/stores', (req, res) => {
    pool.query('SELECT * FROM `store`', function (error, results) {
        if (error) throw error;
        // console.log('response', results);
        res.render('stores', { "title": 'Stores', "stores": results });
    });
});

//link to Products Page
app.get('/products', (req, res) => {
    pool.query('SELECT * FROM `product`', function (error, results) {
        if (error) throw error;
        // console.log('response', results);
        res.render('products', { "title": 'Products', "products": results });
    });
    // res.render('products', { title: 'Products' });
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
        res.render('managers', { "title": 'Managers', "managers": response, "error": ''});
    })
    .catch((error) => {
        // Handle error
        console.error(error);
        res.render('managers', { "title": 'Managers', "managers": [], "error": error});
    })
})

//listen for requests coming in
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});