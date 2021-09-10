var express = require('express');

var app = express();


//Rutas nex se refiere a que cuando se ejecute continue con otra instruccion (se usa con middlewares)
app.get('/', (req, resp, next) => {
    resp.status(200).json({
        ok: true,
        mensaje: 'OK'
    });
});

module.exports = app;