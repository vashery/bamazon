//import modules
var mysql = require("mysql");
var inquirer = require("inquirer");
var columnify = require('columnify');
var validator = require('validator');

//global variables
var useridinput = 0;
var quantinput = 0;
var data = [];

//Setting connection options
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "",
  password: "",
  database: "bamazon"
});

//connect to database and run query to get all items
connection.connect(function (err) {
  if (err) throw err;
  queryAllItems();
});

//run query to get all items, loop through them and display them
function queryAllItems() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) {
      throw err;
    }
    else {
      for (var i = 0; i < res.length; i++) {
        var fordata = {
          "item_id": res[i].item_id,
          "product_name": res[i].product_name,
          "department_name": res[i].department_name,
          "price": res[i].price,
          "stock_quantity": res[i].stock_quantity
        }
        data.push(fordata)
      }
      var columns = columnify(data, {
        columns: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity']
      })
      console.log(columns)
      idInput();
    }
  });
}

//getting id user wants to purcahse
//getting quantity of each one
function idInput() {
  inquirer
    .prompt([
      {
        name: "input1",
        type: "input",
        message: "Enter the item ID you would like to purchase"
      },
      {
        name: "input2",
        type: "input",
        message: "Enter the quantity you would like to purchase"
      }
    ])
    .then(function (answer) {
      if (validator.isInt(answer.input1) && validator.isInt(answer.input2)) {
        useridinput = answer.input1;
        quantinput = answer.input2;
        querySecificItem(useridinput);
      }
      else {
        console.log("invalid input")
        connection.end();
      }
    });
}
//get information about a specific item
function querySecificItem(itemid) {
  connection.query("SELECT * FROM products WHERE item_id=?", [itemid], function (err, res) {
    if (err) {
      throw err;
    }
    else {
      if (res[0].stock_quantity < quantinput) {
        console.log("Insufficient quantity!")
        connection.end();
      }
      else {
        quantupdate = res[0].stock_quantity - quantinput;
        updateQuantity(itemid, res[0].price, quantupdate);

      }

    }
  });
}
//update items quantity based on user input and return the price
function updateQuantity(itemidupdate, cost, updatequant) {
  connection.query("UPDATE products SET stock_quantity=? WHERE item_id=?", [updatequant, itemidupdate], function (err, res) {
    if (err) {
      throw err;
    }
    else {
      totalcost = cost * quantinput;
      console.log("The total cost of your purchase is " + totalcost + "$ thank you have a good day!")
      connection.end();
    }
  });
}