// Projects API route

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

const httpCodes = require('../errors/codes');
const errorTypes = require('../errors/types');

// Implementation goes here

module.exports = routes;
