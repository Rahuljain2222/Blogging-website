require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const mongoose = require("mongoose");
const exp = require("constants");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middlewares/auth");
const Blog = require("./models/blog");

mongoose.connect(process.env.MONGO_URL).then(() => console.log("MongoDB Connected"));
const PORT = process.env.PORT || 8000;


app.set("view engine","ejs");
app.set("views",path.resolve("./views"));
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./")));
app.use(express.static(path.resolve("./public")));
app.get("/",async (req,res)=>{
    const allBlogs = await Blog.find({}).sort({"createdAt":"descending"});
    return res.render("home",{
        user:req.user,
        blogs:allBlogs,
    });
});
app.use("/blog",blogRoute);
app.use("/user",userRoute);

app.listen(PORT,()=>console.log(`Server Started at Port: ${PORT}`));