const express = require('express');
const route = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Joi = require('joi');
const User = require('../models/user');

const configUrl = 'mongodb://localhost:27017/testUsers';

route.post('/register', async (req, res) => {
  const { email, password } = req.body;

  //Validation
  const schema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string()
      .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/))
      .required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  //Checking email registration before

  //Hashing
  const saltRounds = 2;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(`Hashing Error: ${err}`);
    } else {
      // Adding To DataBase
      mongoose.connect(configUrl, async (err, db) => {
        if (err) {
          console.log(`Error accuried: ${err}`);
          res.send(`Error accuried: ${err}`);
        } else {
          await db.collection('testUsers').insertOne({
            email,
            password: hash,
          });
          res.send('Successefully added');
          mongoose.disconnect();
        }
      });
    }
  });
});

route.post('/login', async (req, res) => {
  const { email, password } = req.body;

  //Validate
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    mongoose.connect(configUrl, async (err, db) => {
      if (err) {
        console.log(`Error accuried: ${err}`);
        res.send(`Error accuried: ${err}`);
      } else {
        const user = await db.collection('testUsers').findOne({ email });
        if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        return res.status(200).json({ message: 'Login successful' });
      }
      mongoose.disconnect();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = route;
