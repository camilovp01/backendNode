var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');


//Rutas nex se refiere a que cuando se ejecute continue con otra instruccion (se usa con middlewares)
app.get('/', (req, resp, next) => {
    var desde = Number(req.query.desde || 0);

    Usuario.find({}, 'nombre email img role', (err, usuarios) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }

        Usuario.count({}, (err, conteo) => {
            resp.status(200).json({
                ok: true,
                usuario: usuarios,
                total: conteo
            });
        });

    }).skip(desde)
        .limit(5);
});

//Verificar Token
// app.use('/', (req, resp, next) => {

//     var token = req.query.token;
//     jwt.verify(token, SEED, (err, decoded) => {
//         if (err) {
//             return resp.status(401).json({
//                 ok: false,
//                 mensaje: 'Token incorrecto',
//                 errors: err
//             });
//         }

//         next();
//     });
// });




// Agregar Usuario
app.post('/', mdAutenticacion.verificaToken, (req, resp, next) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error guardando usuarios',
                errors: err
            });
        }

        resp.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });

});

//Actualizar Usuario
app.put('/:id', mdAutenticacion.verificaToken, (req, resp) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error buscando usuarios',
                errors: err
            });
        }

        if (!usuario) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error guardando usuarios',
                    errors: err
                });
            }
            resp.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });
});


//Borrar Usuario
app.delete('/:id', mdAutenticacion.verificaToken, (req, resp) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error borrando usuario con id: ' + id,
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Usuario con el id ' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        resp.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;