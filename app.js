const express = require("express");
const userModel = require("./Models/user");
const postModel = require("./Models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("./multer/multer");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const port = 3000;

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/profile/upload", (req, res) => {
  res.render("profilePicUp");
});

app.post("/upload", isLoggedIn ,multer.single("image"), async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });
  user.profile = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

app.get("/login", (_, res) => {
  res.render("login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  const user = await userModel
    .findOne({ email: req.user.email })
    .populate("post");
  res.render("profile", { user });
});

app.post("/post", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });
  const createPost = await postModel.create({
    user: user._id,
    content: req.body.post,
  });
  console.log(createPost);

  user.post.push(createPost._id);

  await user.save();
  res.redirect("/profile");
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
  const post = await postModel.findOne({ _id: req.params.id }).populate("user");
  const likesIn = post.likes.indexOf(req.user.userid);
  if (likesIn === -1) {
    post.likes.push(req.user.id);
  } else {
    post.likes.splice(likesIn, 1);
  }
  await post.save();
  res.redirect("/profile");
});

app.get("/edit/:id", isLoggedIn, async (req, res) => {
  const post = await postModel.findOne({ _id: req.params.id });
  res.render("edit", { post });
});

app.post("/update/:id", async (req, res) => {
  const editData = await postModel.findOneAndUpdate(
    { _id: req.params.id },
    {
      content: req.body.edit,
    },
    { new: true }
  );
  console.log(req.body.edit);

  res.redirect("/profile");
});

app.post("/register", async (req, res) => {
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
      res.status(200).redirect("/profile");
    } else res.redirect("/login");
  });
});

app.get("/logout", (_, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") res.redirect("/login");
  else {
    const data = jwt.verify(req.cookies.token, "hahahah");
    req.user = data;
    next();
  }
}

app.listen(port);
