#!/usr/bin/env node

const express = require('express')
const app = express()
const port = 3001

app.use(express.static('build'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
