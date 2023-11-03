require("dotenv").config();

import express from "express";

const mongoString = process.env.DATABASE_URL;
const mongoose = require("mongoose");
const penyakitController = require('./controllers/penyakit.controller');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/crawl', penyakitController.addPenyakit);
app.post('/crawl-all', penyakitController.addAllPenyakit);
app.post('/crawl-url', penyakitController.addAllUrlPenyakit);
app.get('/crawl', penyakitController.getPenyakit);

mongoose
  .connect(mongoString)
  .then(() => {
    console.log("Database connected");
  })
  .catch((_error: any) => {
    console.log("Error connecting to database");
  });


app.listen(3080, () => {
  console.log("Server Started at http://localhost:3080");
});

export {};

