const { Schema, model } = require("mongoose");

const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: String,
        required: true,
        trim: true,
    },
    genre: {
        type: String,
    },
    publishedDate: {
        type: Date,
    },
    price: {
        type: Number,
        required: true,
    },
    inStock: {
        type: Boolean,
        default: true,
    },
});

const Book = model("book", bookSchema);

module.exports = Book;
