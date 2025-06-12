const express = require('express');
const userSchema = require("./Models/user");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const app = express();
const port = 3000;

app.get("/", (_, res) => {
    res.render("index");
});

app.listen(port);


