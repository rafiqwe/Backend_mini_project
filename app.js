const express = require("express");
const userModel = require("./Models/user");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = 3000;

app.get("/", isLoggedIn, (req, res) => {
  console.log(req.user);
  res.render("index");
});

app.get("/login", (_, res) => {
  res.render("login");
});

app.post("/register",  async (req, res) => {
  const { username, name, age, email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (user) res.status(500).send("User already Registered");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      const user = await userModel.create({
        username,
        name,
        age,
        email,
        password: hash,
      });

      const token = jwt.sign({ email, userId: user._id }, "hahahah");
      res.cookie("token", token);
      res.send("Registered");
    });
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) res.status(500).send("Somthing Going Wrong!");

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      const token = jwt.sign({ email, userId: user._id }, "hahahah");
      res.cookie("token", token);
      res.status(200).send("You can login");
    } else res.redirect("/login");
  });
});

app.get("/logout", (_, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") res.send("You much be Login");
  else {
    const data = jwt.verify(req.cookies.token, "hahahah");
    req.user = data;
    next();
  }
}

app.listen(port);
