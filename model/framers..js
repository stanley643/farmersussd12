// libraries
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 8000;

// models
const User = require('./model/user');
const Order = require('./model/order');

// mongo database connection
const database_url = 'mongodb://localhost:27017/ussd';
mongoose.connect(database_url);
const db = mongoose.connection;
db.on('error', (err) => {
  console.log(err);
});
db.once('open', () => {
  console.log('database running');
});

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Success message');
});

app.post('/', (req, res) => {
  const { phoneNumber, text, sessionid } = req.body;
  let response;
  if (text === '') {
    response = 'CON Enter your full name';
  } else if (text.split('*').length === 1) {
    response = 'CON Enter your id number';
  } else {
    const array = text.split('*');
    const fullname = array[0];
    const id_number = array[1];

    // check if user exists
    User.findOne({ id_number }).then((user) => {
      if (!user) {
        response = 'END Invalid id number';
        res.send(response);
        return;
      }

      if (array.length === 2) {
        response = 'CON Select a product to order:\n1. Product A\n2. Product B\n3. Product C';
      } else if (array.length === 3) {
        const product_code = parseInt(array[2]);
        let product_name = '';

        switch (product_code) {
          case 1:
            product_name = 'Product A';
            break;
          case 2:
            product_name = 'Product B';
            break;
          case 3:
            product_name = 'Product C';
            break;
          default:
            response = 'END Invalid product code';
            res.send(response);
            return;
        }

        response = `CON Enter quantity for ${product_name}`;
      } else if (array.length === 4) {
        const product_code = parseInt(array[2]);
        let product_name = '';

        switch (product_code) {
          case 1:
            product_name = 'Product A';
            break;
          case 2:
            product_name = 'Product B';
            break;
          case 3:
            product_name = 'Product C';
            break;
          default:
            response = 'END Invalid product code';
            res.send(response);
            return;
        }

        const quantity = parseInt(array[3]);

        // save order to database
        const order = new Order({
          user_id: user._id,
          product_name,
          quantity,
        });
        order
          .save()
          .then(() => {
            response = 'END Order placed successfully.';
          })
          .catch((error) => {
            console.error(error);
            response = 'END An error occurred while placing your order.';
          });
      } else {
        response = 'END Network error. Please try again';
      }
    });
  }

  setTimeout(() => {
    console.log(text);
    res.send(response);
    res.end();
  }, 2000);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
