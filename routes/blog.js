const { Router } = require("express");
const Blog = require("../models/blog");
const Comment = require("../models/comments");
const multer = require("multer");
const path = require("path");
const router = Router();
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const path = `./public/uploads/${req.user._id}`;
      fs.mkdirSync(path, { recursive: true })
      cb(null, path);
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
    limits: { fileSize: 100000 },
    fileFilter: function (req, file, cb) {
      if (!file.originalname.match(/\.(jpg|JPG|webp|jpeg|JPEG|png|PNG|gif|GIF|jfif|JFIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(null, false);
      }
      cb(null, true);
    }
  });
const upload = multer({storage:storage});
router.get("/addNew",(req,res)=>{
    return res.render("addBlog",{
        user: req.user,
    });
});

router.get("/:id",async (req,res) => {
  const comments = await Comment.find({ blogId:req.params.id }).populate("createdBy");
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  return res.render("blog",{
    user:req.user,
    blog,
    comments
  });
});

router.post("/comment/:blogId",async(req,res) => {
  await Comment.create({
    content: req.body.content,
    blogId:req.params.blogId,
    createdBy:req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});


router.post("/",upload.single("coverImage"),async(req,res)=> {
  const { title,body } = req.body;
  const blog = await Blog.create({
    title,
    body,
    createdBy:req.user._id,
    coverImageURL:`/public/uploads/${req.user._id}/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
})
module.exports = router;
