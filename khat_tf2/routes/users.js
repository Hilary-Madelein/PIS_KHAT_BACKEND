var express = require('express');
var router = express.Router();

const {body, validationResult} = require('express-validator');

const AsignaturaController = require('../controls/AsignaturaController');
var asignaturaController = new AsignaturaController();
const CicloController = require('../controls/CicloController');
var cicloController = new CicloController();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
//ASIGNATURAA
router.post('/asignatura/guardar', asignaturaController.guardar);
router.post('/asignatura/modificar', asignaturaController.modificar);
router.get('/asignatura/listar', asignaturaController.listar);
router.get('/asignatura/obtener/:external', asignaturaController.obtener);


router.post('/ciclo/guardar', cicloController.guardar);
router.get('/ciclo/listar', cicloController.listar);

module.exports = router;
