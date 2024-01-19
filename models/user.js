const { createHmac,randomBytes } = require("crypto");
const { Schema,model } = require("mongoose");
const { createTokenForUser } = require("../services/auth");

const userSchema = Schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    salt:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
    profileImageUrl:{
        type:String,
        default:"/public/images/user.png",
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER",
    }
},{timestamps:true});

userSchema.pre("save",function(next){
    const user = this;
    if(!user.isModified("password")) return;
    const salt = randomBytes(16).toString();
    const hashedPass = createHmac("sha256", salt).update(user.password).digest("hex");
    this.salt = salt;
    this.password = hashedPass;
    next();
});

userSchema.static("matchPasswordAndGenerateToken",async function(email,password){
    const user = await this.findOne({ email });
    if(!user) throw new Error("Either Email or Password is not correct");
    // console.log(user);
    const salt = user.salt;
    const hashedPass = user.password;

    const pass = createHmac("sha256",salt).update(password).digest("hex");
    if(pass === hashedPass){
        const token = createTokenForUser(user);
        return token;
    }
    else throw new Error("Incorrect Email or Password");
});

const User = model("user",userSchema);
module.exports = User;