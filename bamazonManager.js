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
  idInput();
});

//run query to get all items, loop through them and display them
function queryAllItems() {
  data = [];
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) {
      throw err;
    }
    else {
      for (var i = 0; i < res.length; i++) {
        fordata = [];
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
      console.log("\n" + columns + "\n")
      idInput();
    }
  });
}

//query to check for items with low quantity
function queryLowItems() {
  data = [];
  var lowthreshold = 5;
  connection.query("SELECT * FROM products WHERE stock_quantity<?", [lowthreshold], function (err, res) {
    if (err) {
      throw err;
    }
    else {
      if (res.length === 0) {
        console.log("\n" + "There are no quantities less than 5" + "\n");
        idInput();
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
        //display results in clean format
        console.log("\n" + columns + "\n")
        idInput();
      }
    }
  });
}

//getting id user wants to purcahse
//getting quantity of each one
function idInput() {
  inquirer
    .prompt([
      {
        name: "managerinput",
        type: "list",
        message: "Select an Option",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "exit"]
      }
    ])
    .then(function (answer) {

      switch (answer.managerinput) {
        case "View Products for Sale":
          queryAllItems();
          break;
        case "View Low Inventory":
          queryLowItems();
          break;
        case "Add to Inventory":
          idInputUpdate();
          break;
        case "Add New Product":
          newRecordInput();
          break;
        case "exit":
          connection.end();
          break;
      }
    });
}
//update quantity to add
function idInputUpdate() {
  inquirer
    .prompt([
      {
        name: "input1",
        type: "input",
        message: "Enter the item ID you would like to modify"
      },
      {
        name: "input2",
        type: "input",
        message: "By how many do you want to increase"
      }
    ])
    .then(function (answer) {
      if (validator.isInt(answer.input1) && validator.isInt(answer.input2)) {
        useridinput = answer.input1;
        quantinput = answer.input2;
        querySecificItem(useridinput, quantinput);
      }
      else {
        console.log("invalid input")
        connection.end();
      }
    });
}
//add new record input
function newRecordInput() {
  inquirer
    .prompt([
      {
        name: "input1",
        type: "input",
        message: "Enter the Product Name"
      },
      {
        name: "input2",
        type: "input",
        message: "Enter the Department Name"
      },
      {
        name: "input3",
        type: "input",
        message: "Enter Price"
      },
      {
        name: "input4",
        type: "input",
        message: "Enter the Quantity"
      }
    ])
    .then(function (answer) {
      if (validator.isInt(answer.input3) && validator.isInt(answer.input4)) {
        nameinput = answer.input1;
        deptinput = answer.input2;
        useridinput = answer.input3;
        quantinput = answer.input4;
        addNewRecord(nameinput, deptinput, useridinput, quantinput);
      }
      else {
        console.log("invalid input")
        connection.end();
      }
    });
}
//query for specific item where id is equal to input
function querySecificItem(itemid, inputquant) {
  connection.query("SELECT * FROM products WHERE item_id=?", [itemid], function (err, res) {
    if (err) {
      throw err;
    }
    else {
      quantupdate = parseInt(res[0].stock_quantity) + parseInt(inputquant);
      updateQuantity(itemid, quantupdate);

    }
  });
}
//update quantity for provided id
function updateQuantity(itemidupdate, updatequant) {
  connection.query("UPDATE products SET stock_quantity=? WHERE item_id=?", [updatequant, itemidupdate], function (err, res) {
    if (err) {
      throw err;
    }
    else {
      console.log("\n" + "The Item's quantity has been updated to " + updatequant + "\n");
      idInput();
    }
  });
}
//query to add new record based on input
function addNewRecord(name, dept, price, quant) {
  connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)", [name, dept, price, quant], function (err, res) {
    if (err) {
      throw err;
    }
    else {
      console.log("\n" + "The new item has been added!" + "\n");
      idInput();
    }
  });
}