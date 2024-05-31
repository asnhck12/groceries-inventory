const Item = require("../models/item");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  // Get details of items and categories
  const [
    numItems,
    numCategories,
  ] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
]);

res.render("index", {
    title: "Groceries Inventory",
    item_count: numItems,
    category_count: numCategories,
})

})

// Display list of all items.
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, "name quantity")
  .sort({ name: 1})
  .populate("quantity")
  .exec();

  res.render("item_list", { title: "Item List", item_list: allItems});
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  const [item] = await Promise.all([
    Item.findById(req.params.id).populate("category").exec(),
  ]);

  if ( item === null ) {
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", {
    name: item.name,
    item: item,
  })
});

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  const [allCategories] = await Promise.all([
    Category.find().sort({ name: 1}).exec(),
  ]);

    res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
    });
  });

// Handle item create on POST.
exports.item_create_post = [
(req, res, next) => {
    if (!Array.isArray(req.body.category)) {
        req.body.category = typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
},

body("name", "Name must not be empty.")
.trim()
.isLength({ min: 1 })
.escape(),
body("description", "Description must not be empty.")
.trim()
.isLength({ min: 1 })
.escape(),
body("price", "Price must not be empty.")
.trim()
.isLength({ min: 1 })
.escape(),
body("quantity", "Quantity must not be empty").trim().isLength({ min: 1 }).escape(),
body("category.*").escape(),

asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        quantity: req.body.quantity,
        category: req.body.category,
    });

    if (!errors.isEmpty()) {
        const [allCategories] = await Promise.all ([
            Category.find().sort({ name: 1 }).exec(),
        ]);

        for (const category of allCategories)  {
            if (item.category.includes(category._id)) {
                category.checked = "true";
            }
        }
        res.render("item_form", {
            title: "Create Item",
            categories: allCategories,
            item: item,
            errors: errors.array(),
        });
    } else {
        await item.save();
        res.redirect(item.url);
    }
}),
]

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
    const [item] = await Promise.all([
      Item.findById(req.params.id).populate("category").exec(),
    ]);
  
    if (item === null) {
      // No results.
      res.redirect("/catalog/items");
    }
  
    res.render("item_delete", {
      title: "Delete Item",
      item: item,
    });
  });

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
    // Assume the post has valid id (ie no validation/sanitization).
  
    const [item] = await Promise.all([
      Item.findById(req.params.id).populate("category").exec(),
    ]);
  
    if (item === null) {
      res.redirect("/catalog/items");
    }
    else {
    await Item.findByIdAndDelete(req.body.id);
    res.redirect("/catalog/items");
}
});

// Display ITEM update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
    const [item, allCategories] = await Promise.all([
      Item.findById(req.params.id).exec(),
      Category.find().sort({ name: 1 }).exec(),
    ]);
  
    if (item === null) {
      const err = new Error("item not found");
      err.status = 404;
      return next(err);
    }
  
    allCategories.forEach((category) => {
      if (item.category.includes(category._id)) category.checked = "true";
    });
  
    res.render("item_form", {
      title: "Update item",
      categories: allCategories,
      item: item,
    });
  });

// Handle item update on POST.
exports.item_update_post = [
    (req, res, next) => {
      if (!Array.isArray(req.body.category)) {
        req.body.category =
          typeof req.body.category === "undefined" ? [] : [req.body.category];
      }
      next();
    },
  
    body("name", "Name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("price", "Price must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("quantity", "Quantity must not be empty").trim().isLength({ min: 1 }).escape(),
    body("category.*").escape(),
  
    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);
  
      const item = new Item({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        quantity: req.body.quantity,
        category: typeof req.body.category === "udefined" ? [] : req.body.category,
        _id: req.params.id,
      });
  
      if (!errors.isEmpty()) {
        const [allCategories] = await Promise.all([
          Category.find().sort({ name: 1 }).exec(),
        ]);
  
        for (const category of allCategories) {
          if (item.category.includes(category._id)) {
            category.checked = "true";
          }
        }
        res.render("item_form", {
          title: "Update Item",
          category: allCategories,
          item: item,
          errors: errors.array(),
        });
        return;
      } else {
        const theitem = await Item.findByIdAndUpdate(req.params.id, item, {});
        res.redirect(theitem.url);
      }
    }),
  ];