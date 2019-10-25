// Requires
var express = require('express');
var mongoose = require('mongoose');

//Inicializar variables
var app = express();


//Conexión DB
mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) throw err + "********************************";
    console.log('Data Base Server running on port 27017:\x1b[32m%s\x1b[0m', ' online');
});

//Rutas nex se refiere a que cuando se ejecute continue con otra instruccion (se usa con middlewares)
app.get('/', (req, resp, next) => {
    resp.status(200).json({
        ok: true,
        mensaje: 'OK'
    });
});


//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server running on port 3000:\x1b[32m%s\x1b[0m', ' online');
})