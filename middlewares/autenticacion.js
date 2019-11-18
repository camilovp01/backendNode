var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

//Verificar Token
exports.verificaToken = function (req, resp, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return resp.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
        // resp.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });
    });
}


exports.verificaAdminRole = (req, resp, next) => {
    var usuario = req.usuario;
    if (usuario.role == "ADMIN_ROLE") {
        next();
    } else {
        return resp.status(401).json({
            ok: false,
            mensaje: 'Operación no permitida rol incorrecto',
            errors: { message: 'No es Administrador' }
        });
    }
}

exports.verificaAdminOMismoUsuario = (req, resp, next) => {
    var usuario = req.usuario;
    var id = req.params.id;
    if (usuario.role === "ADMIN_ROLE" || usuario._id === id) {
        next();
    } else {
        return resp.status(401).json({
            ok: false,
            mensaje: 'Operación no permitida rol incorrecto',
            errors: { message: 'No es Administrador o no es el mismo usuario' }
        });
    }
}

