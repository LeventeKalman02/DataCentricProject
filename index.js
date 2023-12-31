const express = require('express');
const app = express();
const port = 3000;
const dao = require('./DAO');
const ObjectId = require('mongodb').ObjectId;
//body-parser
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))

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
const mysql = require('mysql2');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'proj2023'
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

//link to Store edit Page
app.get('/store/edit/:sid', (req, res) => {
    const id = req.params.sid;
    pool.query('SELECT * FROM `store` WHERE sid="'+id+'"', function (error, results) {
        if (error) throw error;
        // console.log('response', results);
        res.render('editstore', { "title": 'Stores', "store": results[0], "error": "" });
    });
});

//update store
app.post('/store/edit', (req, res) => {
    const id = req.body.sid;
    const loc = req.body.location;
    const manager = req.body.mgrid;
    console.log(id, loc, manager);

    //throw error for manager length
    if(manager.length != 4){
        res.render('editstore', { "title": 'Stores', "store": req.body, "error": "Invalid manager id, must be 4 characters" });
        return;
    }
    //detect if location is filled
    if(loc.length < 1){
        res.render('editstore', { "title": 'Stores', "store": req.body, "error": "Location cannot be empty" });
        return;
    }

    pool.query('SELECT * FROM `store` WHERE mgrid="'+manager+'"', function (error, results) {
        if (error) throw error;
        if(results.length <= 0){
            dao.findAll(coll).then((response) => {
                // Process response
                console.log("response", response);

                //detect if manager exists in mongoDB
                var hasFound = false;
                for (let i = 0; i < response.length; i++) {
                    const item = response[i];
                    
                    if(item._id == manager){
                        hasFound = true;
                        break;
                    }
                }
                //execute code if data entered is okay
                if(hasFound){
                    pool.query('UPDATE `store` SET location= "'+loc+'", mgrid= "'+manager+'" WHERE sid="' + id +'"', function (error, results) {
                        if (error) throw error;
                        res.redirect('/stores');
                    });
                }
                //throw error if manager doesnt exist
                else{
                    res.render('editstore', { "title": 'Stores', "store": req.body, "error": "Manager doesn't exist" });
                }
            }).catch((error) => {
                // Handle error
                console.error(error);
            })
        }
        //throw error if manager is already assigned
        else{
            res.render('editstore', { "title": 'Stores', "store": req.body, "error": "Manager is already assinged to another store" });
        }
    });
});

//link to Store add Page
app.get('/store/add', (req, res) => {
    res.render('addstore', { "title": 'Add Store', "error": "" });
    console.log(req.body.sid, req.body.location);
});

//add new store
app.post('/store/add', (req, res) => {
    const id = req.body.sid;
    const loc = req.body.location;
    const manager = req.body.mgrid;
    console.log(id, loc, manager, req.body);

    //throw error for manager length
    if (manager.length != 4) {
        res.render('addstore', { "title": 'Add Store', "Add Store": req.body, "error": "Invalid manager id, must be 4 characters" });
        return;
    }
    //detect if location is filled
    if (loc.length < 1) {
        res.render('addstore', { "title": 'Add Store', "store": req.body, "error": "Location cannot be empty" });
        return;
    }

    pool.query('SELECT * FROM `store` WHERE mgrid="' + manager + '"', function (error, results) {
        if (error) throw error;
        if (results.length <= 0) {
            dao.findAll(coll).then((response) => {
                // Process response
                console.log("response", response);

                //detect if manager exists in mongoDB
                var hasFound = false;
                for (let i = 0; i < response.length; i++) {
                    const item = response[i];

                    if (item._id == manager) {
                        hasFound = true;
                        break;
                    }
                }
                //execute code if data entered is okay
                if (hasFound) {
                    pool.query('INSERT INTO `store`(sid, location, mgrid) VALUES ("'+id+'","'+loc+'","'+manager+'")', function (error, results) {
                        if (error) throw error;
                        res.redirect('/stores');
                    });
                }
                //throw error if manager doesnt exist
                else {
                    res.render('addstore', { "title": 'Add Store', "store": req.body, "error": "Manager doesn't exist" });
                }
            }).catch((error) => {
                // Handle error
                console.error(error);
            })
        }
        //throw error if manager is already assigned
        else {
            res.render('addstore', { "title": 'Stores', "store": req.body, "error": "Manager is already assinged to another store" });
        }
    });
});


//link to Products Page
app.get('/products', (req, res) => {
    //SELECT * FROM `product_store` INNER JOIN product ON product_store.pid = product.pid INNER JOIN store on product_store.sid = store.sid
    pool.query('SELECT * FROM `product_store` INNER JOIN product ON product_store.pid = product.pid INNER JOIN store on product_store.sid = store.sid', function (error, results) {
        if (error) throw error;
        // console.log('response', results);
        res.render('products', { "title": 'Products', "products": results, "error": "" });
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
                res.redirect('/products');
            });
        }
        else{
            pool.query('SELECT * FROM `product_store` INNER JOIN product ON product_store.pid = product.pid INNER JOIN store on product_store.sid = store.sid', function (error1, results1) {
                if (error1) throw error1;
                console.log('response', results);
                res.render('products', { "title": 'Products', "products": results1, "error": id + " is currently sold in stores and cannot be deleted" });
            });
        }
    });
});

//link to managers page and also getting the data from the collection
app.get('/managers', (req, res) => {
    dao.findAll(coll)
    .then((response) => {
        // Process response
        //console.log("response", response);
        res.render('managers', { "title": 'Managers', "managers": response, "error": ''});
    })
    .catch((error) => {
        // Handle error
        console.error(error);
        res.render('managers', { "title": 'Managers', "managers": [], "error": error});
    })
});

//link to add manager page
app.get('/manager/add', (req, res) => {
    res.render('addmanager', { "title": 'Add Manager', "error": ''});
});

//add new manager
app.post('/manager/add', (req, res) => {
    const id = req.body._id;
    const name = req.body.name;
    const salary = req.body.salary;

    if (name.length <= 5){
        res.render('addmanager', { "title": 'name', "manager": req.body, "error": "Name must be longer than 5 characters" });
        return;
    }
    if (salary < 30000 || salary > 70000) {
        res.render('addmanager', { "title": 'salary', "manager": req.body, "error": "Salary must be between 30,000 and 70,000" });
        return;
    }else{
        dao.addManager(coll, {
            //unique id is automatically generated by MongoDB and cannot be changed
            "_id": new ObjectId(id),
            "name": name,
            "salary": salary
        })
            .then((result) => {
                res.redirect("/managers");
            })
            .catch((error) => {
                if (error.message.includes("E11000")) {
                    res.send("Error _id:" + id + " already exists")
                } else {
                    res.send(error.message)
                }
            });
    }    
});

//listen for requests coming in
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});