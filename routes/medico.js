var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

app.get('/', (req, resp) => {
    var desde = Number(req.query.desde || 0);

    Medico.find({}, (err, medicos) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error cargando medicos',
                errors: err
            });
        }

        Medico.count({}, (err, conteo) => {
            resp.status(200).json({
                ok: true,
                medico: medicos,
                total: conteo
            });
        });
    }).populate('usuario', ['nombre', 'email'])
        .populate('hospital', ['nombre'])
        .skip(desde)
        .limit(5);

});

app.get('/:id', (req, resp) => {
    var id = req.params.id;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error cargando medicos',
                errors: err
            });
        }
        resp.status(200).json({
            ok: true,
            medico
        });
    }).populate('usuario', ['nombre', 'email', 'img'])
        .populate('hospital');

});

app.post('/', mdAutenticacion.verificaToken, (req, resp) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error guardando medicos',
                errors: err
            });
        }

        resp.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario
        });
    });

});

app.put('/:id', mdAutenticacion.verificaToken, (req, resp, next) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medicoDB) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error buscando médicos',
                errors: err
            });
        }

        if (!medicoDB) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Médico con el id ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        medicoDB.nombre = body.nombre;
        medicoDB.img = body.img;
        medicoDB.usuario = req.usuario._id,
            medicoDB.hospital = body.hospital;

        medicoDB.save((err, medicoGuardado) => {
            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error guardando médicos',
                    errors: err
                });
            }

            resp.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

app.delete('/:id', mdAutenticacion.verificaToken, (req, resp) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error borrando médico con id: ' + id,
                errors: err
            });
        }

        if (!medicoBorrado) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Médico con el id ' + id + 'no existe',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        resp.status(200).json({
            ok: true,
            hospital: medicoBorrado
        });
    });
});

module.exports = app;