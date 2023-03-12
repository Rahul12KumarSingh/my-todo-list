const express = require('express');
const bodyParser = require('body-parser');

const _ = require("lodash");

//mongoose code start here !!! 
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin-rahul:test123@cluster0.mf66oxb.mongodb.net/todolist");

const itemSchema = mongoose.Schema({
    name: String,
});

const Item = mongoose.model("Item", itemSchema);


//creating the three new items 
const a = new Item({
    name: "milk",
});

const b = new Item({
    name: "butter",
});

const c = new Item({
    name: "ghee",
});


// creating the dynamic collection (custom collections of the item)
var defaultItems = [a, b, c];


const listSchema = mongoose.Schema({
    name: String,
    items: [itemSchema],
});

const List = mongoose.model("List", listSchema);
// -- end here -->


const ejs = require('ejs');
const app = express();


app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static("public"));

app.set('view engine', 'ejs');


//-- home page -->

app.get('/', function (req, res) {

    Item.find().then(function (val) {
        res.render('main', { day: "Today", listitem: val })
    })

});


// default page -->
app.get("/:customListName", function (req, res) {

    const customListName = _.capitalize(req.params.customListName);
   

    List.findOne({ name: customListName }).then(function (foundList) {

        if (!foundList) {
            console.log("Doesn't Exist");
            // create the new list 

            const list = new List({
                name: customListName,
                items: defaultItems,
            })

            list.save();
            res.redirect("/" + customListName);
        }

        else {
            console.log("exist");
            // show hthe existing list 
            res.render("main", { day: foundList.name, listitem: foundList.items });
        }
    })

})



app.get('/anotherpage', function (req, res) {
    res.render('anotherpage');
})


app.post('/', function (req, res) {
    const listName = req.body.btn;
    const itemName = req.body.username;


    const item = new Item({
        name: itemName,
    });


    if (listName == "Today") {
        item.save();
        res.redirect('/');
    }


    else {

        List.findOne({ name: listName }).then(function (foundList) {
            foundList.items.push(item);

            foundList.save();
            res.redirect("/" + listName);
        });
    }

})

app.post('/delete', function (req, res) {
    const checkedItemName = req.body.box;
    const listName = req.body.listName;


     console.log(listName);
    // console.log(boxvalue);

    // console.log(this);
    // Item.findByIdAndRemove(boxvalue);
    // Item.deleteOne({ name: boxvalue });

    if (listName == "Today") {

        Item.deleteMany({name: checkedItemName }).then(function () {
            console.log("deleted sucessfully !!");
        });

        res.redirect('/');
    }

    else{

        List.findOneAndUpdate({name: listName} , {$pull: {items:{name:checkedItemName}}}).then(function(){
            
            console.log("item deleted succesfully !!!");
            res.redirect("/" + listName);           
        }) ;
    }

}) 




app.listen( process.env.PORT || 3000, function () {
    console.log("app is listing at the port 3000 : ");
})