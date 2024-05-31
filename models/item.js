const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: { type: String, required: true, maxLength: 100},
    description: { type: String, required: true, maxLength: 250},
    price: {type: Number},
    quantity: {type: Number},
    category: [{ type: Schema.ObjectId, ref: "Category"}],
});

ItemSchema.virtual("url").get(function () {
    return "/catalog/item/" + this._id;
})

module.exports = mongoose.model("Item", ItemSchema);