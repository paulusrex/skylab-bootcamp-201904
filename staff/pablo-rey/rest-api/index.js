require('dotenv').config()

const express = require('express')
const cors= require('cors');
const package = require('./package.json')

const { env: { PORT }, argv: [, , port = PORT || 8080], } = process

const app = express()
app.use(cors());
app.use('/api', [require('./routes/users'), require('./routes/ducks')])

app.use(function (req, res, next) {
    res.redirect('/')
})

app.listen(port, () => console.log(`${package.name} ${package.version} up on port ${port}`))