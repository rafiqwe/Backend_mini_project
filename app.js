const express = require('express');
const userSchema = require("./Models/user");
const cookieParser = require('cookie-parser');

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const port = 3000;

app.get("/", (_, res) => {
    res.render("index");
});

app.listen(port);


