const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Blog = require("../models/blog");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error("Age can't be -ve.")
            }
        }
    },
    articles: {
      type: Number,
      default: 0
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
}, {
    timestamps: true
})

userSchema.virtual("blogs", {
    ref: "Blog",
    localField: "_id",
    foreignField: "author"
})

userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({_id: user._id.toString() }, process.env.JWT_TOKEN)

    user.tokens = user.tokens.concat({ token })
    await user.save();
    return token
}

userSchema.methods.toJSON = function () {
    const user = this.toObject()
    delete user.password
    delete user.tokens
    delete user.id
    delete user.avator

    return user
}

userSchema.statics.findByCredentials = async function(email, password) {
    const user = await User.findOne({ email })

    if (!user && !(await bcrypt.compare(password, user.password))) {
        throw new Error("Unable to login.")
    }

    return user
}

userSchema.pre('save', async function(next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.pre(
    "deleteOne", { document: true, query: false }, async function(next) {
        const user = this
        await Blog.deleteMany({ author: user._id })
        next()
    }
)


const User = mongoose.model("User", userSchema)

module.exports = User