var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');


// autenticación google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// autenticacion normal
app.post('/', (req, resp) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }

        if (!usuarioDB) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Usuario o contraseña incorrectos -email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Usuario o contraseña incorrectos -password',
                errors: err
            });
        }

        usuarioDB.password = ':)';
        //Crear Token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4horas
        return resp.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });

    });
});

// Autenticacion por google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async (req, resp) => {
    var token = req.body.token;
    var googleUser = await verify(token).catch(err => {
        resp.status(403).json({
            ok: false,
            mensaje: 'Token no válido.',
            errors: err
        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google) {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4horas
                return resp.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id
                });
            } else {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar autenticación normal'
                });
            }
        } else { // Crear el usuario
            var usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                img: googleUser.img,
                google: true,
                password: ':)'
            });

            usuario.save((err, usuarioGuardado) => {
                if (err) {
                    return resp.status(400).json({
                        ok: false,
                        mensaje: 'Error guardando usuarios',
                        errors: err
                    });
                }
                var token = jwt.sign({ usuario: usuarioGuardado }, SEED, { expiresIn: 14400 }); //4horas
                resp.status(200).json({
                    ok: true,
                    usuario: usuarioGuardado,
                    token: token,
                    id: usuarioGuardado.id
                });
            })
        }
    });
});

module.exports = app