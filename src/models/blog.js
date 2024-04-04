const mongoose = require("mongoose");

const blogSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    body: {
        type: String,
        required: true
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    likeBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            unique: true
        },
    ]
  },
  {
    timestamps: true,
  }
);

blogSchema.index({ title: 'text' })

const Blog = mongoose.model("blog", blogSchema)

module.exports = Blog;