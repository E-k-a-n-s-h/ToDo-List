//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Ekansh:Ekanshgoel14@cluster0-nhckq.mongodb.net/todoListDB" , {useNewUrlParser:true , useUnifiedTopology:true});
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({
  name: "Welcome to your To-do List!!"
});


const defaultArray = [item1];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List" , listSchema);

app.get("/", function(req, res) {

  Item.find({} , function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultArray , function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully Done")  ;
        }
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:customlistName" , function(req,res){
  const customlistName = req.params.customlistName;

  List.findOne({name: customlistName} , function(err, foundList){
    if(!err){
      if(!foundList){
        //create new list
        const list = new List({
          name: customlistName,
          items: [itemsSchema]
        });
        list.save();
        res.redirect("/" + customlistName);
      }
      else{
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
      }
    }
  })
})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const saveItemName = new Item({
    name: itemName
  });

  if(listName === "Today"){
    saveItemName.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(saveItemName);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});



app.post("/delete" , function(req,res){
  const deletedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(deletedItemId , function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully Deleted");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName} , {$pull: {items: {_id: deletedItemId}}} , function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }
});



let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port , function() {
  console.log("Server started on port 3000");
});
