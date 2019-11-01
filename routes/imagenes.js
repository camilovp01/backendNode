var express = require('express');
var fs = require('fs');
const path = require('path'); //-> ya viene con node

var app = express();


//Rutas nex se refiere a que cuando se ejecute continue con otra instruccion (se usa con middlewares)
app.get('/:coleccion/:img', (req, resp, next) => {
    var coleccion = req.params.coleccion;
    var img = req.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${coleccion}/${img}`);

    if (fs.existsSync(pathImagen)) {
        resp.sendFile(pathImagen);
    } else {
        var pathImagenDefault = path.resolve(__dirname, `../assets/no-img.jpg`);
        resp.sendFile(pathImagenDefault);
    }
});

module.exports = app;