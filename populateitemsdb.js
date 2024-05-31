#! /usr/bin/env node

console.log(
    'This script populates some test items and categories to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Item = require("./models/item");
  const Category = require("./models/category");
  
  const items = [];
  const categories = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createItems();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  // We pass the index to the ...Create functions so that, for example,
  // genre[0] will always be the Fantasy genre, regardless of the order
  // in which the elements of promise.all's argument complete.
  async function categoryCreate(index, name) {
    const category = new Category({ name: name });
    await category.save();
    categories[index] = category;
    console.log(`Added category: ${name}`);
  }
  
  async function itemCreate(index, name, description, price, quantity, category) {
    const itemdetail = {
      name: name,
      description: description,
      price: price,
      quantity: quantity,
    };
    if (category != false) itemdetail.category = category;
  
    const item = new Item(itemdetail);
    await item.save();
    items[index] = item;
    console.log(`Added item: ${name}`);
  }
  
  async function createCategories() {
    console.log("Adding Categories");
    await Promise.all([
      categoryCreate(0, "Vegetables"),
      categoryCreate(1, "Dairy"),
      categoryCreate(2, "Fruit"),
    ]);
  }

  async function createItems() {
    console.log("Adding items");
    await Promise.all([
      itemCreate(0,
        "Red Apple",
        "A pack of 6 Red Apples",
        1.79,
        20,
        [categories[2]]
      ),
      itemCreate(1,
        "Green Apple",
        "A pack of 6 Green Apples",
        1.99,
        25,
        [categories[2]]
      ),
      itemCreate(2,
        "Cucumber",
        "One plastic wrapped Cucumber",
        1.09,
        14,
        [categories[0]]
      ),
      itemCreate(3,
        "Leicester Cheese",
        "450g block of Leicester Cheese",
        3.79,
        7,
        [categories[1]]
      ),
      itemCreate(4,
        "Broccoli",
        "One large head of Broccoli",
        1.29,
        5,
        [categories[0]]
      ),
      itemCreate(5,
        "Whole Milk",
        "2L Whole Milk",
        1.45,
        18,
        [categories[1]]
      ),
    ]);
  }

  