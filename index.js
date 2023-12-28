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

// pool.query('SELECT * FROM `product`', function (error, results, fields) {
//     if (error) throw error;
//     console.log('response', results);
// });


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
    //SELECT * FROM `product_store` INNER JOIN product ON product_store.pid = product.pid INNER JOIN store on product_store.sid = store.sid
    pool.query('SELECT * FROM `product_store` INNER JOIN product ON product_store.pid = product.pid INNER JOIN store on product_store.sid = store.sid', function (error, results) {
        if (error) throw error;
        // console.log('response', results);
        res.render('products', { "title": 'Products', "products": results });
    });
    // res.render('products', { title: 'Products' });
});

//link to Product delete Page
app.get('/product/delete/:pid', (req, res) => {
    //'SELECT * FROM `product_store` INNER JOIN product ON product_store.pid = product.pid INNER JOIN store on product_store.sid = store.sid WHERE product.pid="' + req.params.pid + '"'
    
    const id = req.params.pid;
    pool.query('SELECT * FROM `product_store` WHERE product_store.pid="' + id + '"', function (error, results) {
        if (error) throw error;
        if(results.length <= 0){
            pool.query('DELETE FROM `product` WHERE pid="' + id + '"', function (error, results) {
                if (error) throw error;
                console.log(id, "has been deleted");
            });
        }
        else{
            console.log(id, "cannot be deleted (is in stores)");
        }
    });
});

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