var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Hospital = require('../models/hospital');

app.get('/', (req, resp, next) => {
    var desde = Number(req.query.desde || 0);
    Hospital.find({}, (err, hospitales) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }

        Hospital.count({}, (err, conteo) => {
            resp.status(200).json({
                ok: true,
                hospitales: hospitales,
                total: conteo
            });
        });

    }).populate('usuario', ['nombre', 'email']) // traer datos de las relaciones de las tablas
        .skip(desde)
        //.limit(5);
});

app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: { message: 'No existe un hospitalcon ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
});

app.post('/', mdAutenticacion.verificaToken, (req, resp, next) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error guardando hospitales',
                errors: err
            });
        }

        resp.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario
        });
    });

});

app.put('/:id', mdAutenticacion.verificaToken, (req, resp) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospitalDB) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error buscando hospitales',
                errors: err
            });
        }

        if (!hospitalDB) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospitalDB.nombre = body.nombre;
        hospitalDB.img = body.img;
        hospitalDB.usuario = req.usuario._id,

            hospitalDB.save((err, hospitalGuardado) => {
                if (err) {
                    return resp.status(400).json({
                        ok: false,
                        mensaje: 'Error guardando hospitales',
                        errors: err
                    });
                }
                resp.status(200).json({
                    ok: true,
                    hospital: hospitalGuardado
                });
            });
    });
});

app.delete('/:id', mdAutenticacion.verificaToken, (req, resp) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error borrando hospital con id: ' + id,
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Hospital con el id ' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        resp.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;