var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload({
    createParentPath: true
}));

app.put('/:coleccion/:id', (req, resp) => {
    var coleccion = req.params.coleccion;
    var id = req.params.id;

    var coleccionesValidas = ['hospitales', 'medicos', 'usuarios'];

    if (coleccionesValidas.indexOf(coleccion.toLowerCase()) < 0) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Colección no válida',
            errors: { message: 'Colecciones permitidas: hospitales, medicos, usuarios' }
        });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Error subiendo imagen',
            errors: { message: 'No se encuentra la imagen' }
        });
    }

    var tipoImagen = req.files.imagen.mimetype.split('/')[0];

    if (tipoImagen != 'image') {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Error subiendo imagen',
            errors: { message: 'El formato no es permitido, intente con un formato .jpg .png ó .gif' }
        });
    }

    var imagen = req.files.imagen;
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${req.files.imagen.name}`;
    var path = './uploads/' + coleccion + '/' + nombreArchivo;
    imagen.mv(path, (err) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error moviendo archivo',
                errors: err
            });
        }

        subirPorTipo(coleccion, id, path, resp);
    });
});

function subirPorTipo(coleccion, id, path, resp) {

    switch (coleccion) {
        case 'usuarios':
            Usuario.findById(id, (err, usuarioDb) => {
                if (err) {
                    return resp.status(500).json({
                        ok: false,
                        mensaje: 'Error buscando usuarios',
                        errors: err
                    });
                }
                if (!usuarioDb) {
                    return resp.status(400).json({
                        ok: false,
                        mensaje: 'Usuario con el id ' + id + ' no existe',
                        errors: { message: 'No existe un usuario con ese ID' }
                    });
                }

                if (fs.existsSync(usuarioDb.img)) {
                    fs.unlinkSync(usuarioDb.img);
                }

                usuarioDb.img = path;

                usuarioDb.save((err, usuarioActualizado) => {
                    if (err) {
                        return resp.status(500).json({
                            ok: false,
                            mensaje: 'Error actualizando usuario',
                            errors: err
                        });
                    }
                    usuarioActualizado.password = ':D';
                    return resp.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actulizada correctamente',
                        usuario: usuarioActualizado
                    });
                });
            });
            break;

        case 'medicos':
            Medico.findById(id, (err, medicoDb) => {
                if (err) {
                    return resp.status(500).json({
                        ok: false,
                        mensaje: 'Error buscando medico',
                        errors: err
                    });
                }
                if (!medicoDb) {
                    return resp.status(400).json({
                        ok: false,
                        mensaje: 'Medico con el id ' + id + ' no existe',
                        errors: { message: 'No existe un medico con ese ID' }
                    });
                }

                if (fs.existsSync(medicoDb.img)) {
                    fs.unlinkSync(medicoDb.img);
                }

                medicoDb.img = path;

                medicoDb.save((err, medicoActualizado) => {
                    if (err) {
                        return resp.status(500).json({
                            ok: false,
                            mensaje: 'Error actualizando medico',
                            errors: err
                        });
                    }
                    return resp.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actulizada correctamente',
                        medico: medicoActualizado
                    });
                });
            });

            break;

        case 'hospitales':
            Hospital.findById(id, (err, hospitalDb) => {
                if (err) {
                    return resp.status(500).json({
                        ok: false,
                        mensaje: 'Error buscando hospital',
                        errors: err
                    });
                }
                if (!hospitalDb) {
                    return resp.status(400).json({
                        ok: false,
                        mensaje: 'Hospital con el id ' + id + ' no existe',
                        errors: { message: 'No existe un hospital con ese ID' }
                    });
                }

                if (fs.existsSync(hospitalDb.img)) {
                    fs.unlinkSync(hospitalDb.img);
                }

                hospitalDb.img = path;

                hospitalDb.save((err, hospitalActualizado) => {
                    if (err) {
                        return resp.status(500).json({
                            ok: false,
                            mensaje: 'Error actualizando hospital',
                            errors: err
                        });
                    }
                    return resp.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actulizada correctamente',
                        hospital: hospitalActualizado
                    });
                });
            });
            break;

        default:
            break;
    }
}

module.exports = app