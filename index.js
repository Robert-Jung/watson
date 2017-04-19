var fs = require('fs')
var express = require('express')
var bodyParser = require('body-parser')
var multer = require('multer')
var convertToWav = require('./convert-to-wav')
var deleteWav = require('./delete-wav')
var searchString = require('./find-search-string')
var findProduct = require('./find-product.js')
var callWatson = require('./call-watson')

var products = [
  {
    upc: '1234',
    name: 'hot wheels',
    inventory: 12,
    price: 13.99
  },
  {
    upc: '5784',
    name: 'doll',
    inventory: 23,
    price: 1.99
  },
  {
    upc: '0012',
    name: 'catan',
    inventory: 50,
    price: 48.71
  }
]

var app = express()
app.use(express.static('public'))
app.use(bodyParser.json())

var upload = multer({ dest:'tmp/' })

app.post('/command', upload.single('file'), (req, res) => {
  console.log(req.file)
  convertToWav(req.file.path)
    .then( fileName => {
      deleteWav(req.file.path)
      return callWatson('./transcribe/' + fileName)
    }).then( transcription => {
      return searchString(transcription)
    }).then( productUPC => {
      console.log(productUPC)
      return findProduct(productUPC, products)
    }).then( product => {
      console.log(product)
      res.json(product)
    }).catch( () => {
      res.sendStatus(500)
  })
})

app.listen(3000, () => {
  console.log('Listening on port 3000')
})
