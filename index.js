const express = require('express');
const app = express();
const port = 3000;

//register view engine
app.set('view engine', 'ejs');

//link to Main Page
app.get('/', (req, res) => {
    res.render('mainpage');
});

//link to Stores Page
app.get('/stores', (req, res) => {
    res.render('stores');
});

//link to Products Page
app.get('/products', (req, res) => {
    res.render('products');
});

//link to Managers Page
app.get('/managers', (req, res) => {
    res.render('managers');
});

//listen for requests coming in
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});