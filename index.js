const express = require('express');
const app = express();
const bodyParser = require('body-parser');

//Route
const User = require('./route/User');
const port = 7777;

app.use(bodyParser.json());
app.use(User);

app.listen(port, (err) => {
  if (err) {
    console.log(`Something wrong happen: ${err}`);
  } else {
    console.log(`App is running on port ${port}`);
  }
});
