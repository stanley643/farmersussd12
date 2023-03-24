// libraries
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 8000;


// models
const User = require('./model/user')

// mongo database connection
const database_url = 'mongodb://localhost:27017/ussd';
mongoose.connect(database_url);
const db = mongoose.connection;
db.on('error', (err) => {
    console.log(err)
})
db.once('open', () => {
    console.log('database running')
})

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get('/', (req, res) => {
    res.send('Sucess message')
})

app.post('/', (req, res) => {
    const {phoneNumber, text, sessionid} = req.body
    let response;
    if (text === '') {
        response = 'CON Enter your full name'
    }
    if (text !== ''){
        let array = text.split('*');
        if (array.length === 1){ 
            response = 'CON Enter your id number'
        }
        else if(array.length === 2) {
            // id number
            if (parseInt(array[1])>0){
                response = 'CON please confirm if you want to save the data.\n1. Confirm\n2. Cancel' 
            }
            
            else {
                response = 'END Network error. Please try again'
            }

        }
        else if(array.length===3)
        {
            if(parseInt(array[2])===1)
             {
                let data = new User();
                data.fullname = array[0];
                data.id_number = array[1];
                data.save()
                .then(() => {
                    response = 'END Your data was saved successfully.';
                })
                .catch((error) => {
                    console.error(error);
                    response = 'END An error occurred while saving your data.';
                });


            }
            else if(parseInt(array[2])===2) {
                response = 'END Sorry, data was not saved.'
            }
            else
            {
                response = 'END Invalid input.'
            }
        }
        else {
            response = 'END Network error. Please try again'
         }
    }



    setTimeout(() => {
        console.log(text)
        res.send(response);
        res.end()
        
    }, 2000);
})




app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
})