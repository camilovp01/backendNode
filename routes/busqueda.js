var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

app.get('/todo/:busqueda', (req, resp) => {
    var busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, 'i'); // 'i' insensible ante mayusculas y minusculas

    Promise.all(
        [buscarHospitales(regex), buscarMedicos(regex), buscarUsuarios(regex)]
    ).then(respuestas => {
        resp.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});

app.get('/coleccion/:tabla/:busqueda', (req, resp) => {
    var busqueda = req.params.busqueda;
    var tabla = String(req.params.tabla);

    var regex = new RegExp(busqueda, 'i'); // 'i' insensible ante mayusculas y minusculas

    var promesa;

    switch (tabla.toLowerCase()) {
        case 'hospital':
            promesa = buscarHospitales(regex);
            break;

        case 'medico':
            promesa = buscarMedicos(regex);
            break;

        case 'usuario':
            promesa = buscarUsuarios(regex);
            break;

        default:
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error en los parámetros de búsqueda',
                errors: { message: 'tipo de coleccion/tabla no válido' }
            });
    }

    promesa.then(data => {
        resp.status(200).json({
            ok: true,
            [tabla]: data
        });
    }).catch(err => {
        resp.status(500).json({
            ok: false,
            mensaje: 'Error buscando [tabla]',
            error: 'Error buscando ' + tabla + ' ' + err
        });
    });


});

function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ 'nombre': regex }, (err, hospitales) => {
            if (err) {
                reject("Error al buscar Hospitales", err);
            } else {
                resolve(hospitales);
            }
        }).populate('usuario', 'nombre email');
    });
}

function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ 'nombre': regex }, (err, medicos) => {
            if (err) {
                reject("Error al buscar Médicos", err);
            } else {
                resolve(medicos);
            }
        }).populate('usuario', 'nombre email')
            .populate({ path: 'hospital', populate: [{ path: 'usuario', select: 'nombre email' }] }); // poblar un elemento y su elemento hijo
    });
}


function buscarUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email', (err, usuarios) => {
            if (err) {
                reject("Error al buscar usuarios", err);
            } else {
                resolve(usuarios);
            }
        }).or([{ "nombre": regex }, { "email": regex }]); // buscar en multiples campos
    });
}

module.exports = app;