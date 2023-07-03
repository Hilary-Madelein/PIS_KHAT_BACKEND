var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');

const { body, validationResult } = require('express-validator');
const RolController = require('../controls/RolController');
var rolController = new RolController();
const PersonaController = require('../controls/PersonaController');
var personaController = new PersonaController();
const CuentaController = require('../controls/CuentaController');
var cuentaController = new CuentaController();
const MatriculaController = require('../controls/MatriculaController');
var matriculaController = new MatriculaController();
const PeriodoController = require('../controls/PeriodoController');
var periodoController = new PeriodoController();
const PersonaRolController = require('../controls/PersonaRolController');
var personaRolController = new PersonaRolController();
const AsignaturaController = require('../controls/AsignaturaController');
var asignaturaController = new AsignaturaController();
const CicloController = require('../controls/CicloController');
var cicloController = new CicloController();
const PracticaController  = require('../controls/PracticaController');
var practicaController  = new PracticaController();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

var auth = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  if (token) {
    require('dotenv').config();
    const llave = process.env.KEY;
    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        res.status(401);
        res.json({
          msg: "TOKEN NO VALIDO",
          code: 401
        });
      } else {
        var models = require('../models');
        var cuenta = models.cuenta;
        req.decoded = decoded;
        let aux = await cuenta.findOne({ where: { external_id: req.decoded.external } })
        if (aux === null) {
          res.status(401);
          res.json({
            msg: "TOKEN NO VALIDO O EXPIRADO",
            code: 401
          });
        } else {
          next();
        }
      }
    });
  } else {
    res.status(401);
    res.json({
      msg: "NO EXISTE TOKEN",
      code: 401
    });
  }

}

//CUENTA
router.post('/sesion', [
  body('correo', 'Ingrese un correo').trim().exists().not().isEmpty().isEmail(),
  body('clave', 'Ingrese una clave').trim().exists().not().isEmpty(),
], cuentaController.sesion);

//GET
//------Personas
router.get('/roles', rolController.listar);
router.get('/personas', personaController.listar);
router.get('/listadoregistro', personaRolController.listar); 
router.get('/personas/obtener/:external', personaController.obtener);

//------Periodo
router.get('/periodo/listar', periodoController.listar);
router.get('/periodo/obtener/:external', periodoController.obtener);

//------Matricula
router.get('/matriculas/listar', matriculaController.listar);
router.get('/matriculas/obtener/:external', matriculaController.obtener);

//POST
//------Personas
router.post('/personas/guardar', [
  body('apellidos', 'Ingrese sus apellidos').trim().exists().not().isEmpty().isLength({ min: 3, max: 50 }).withMessage("Ingrese un valor mayor o igual a 3 y menor a 50"),
  body('nombres', 'Ingrese sus nombres').trim().exists().not().isEmpty().isLength({ min: 3, max: 50 }).withMessage("Ingrese un valor mayor o igual a 3 y menor a 50"),
], personaController.guardar);
router.post('/personas/modificar', personaController.modificar);
router.post('/personas/cambiarEstado', personaController.cambiarEstado);

//------Periodo
router.post('/periodo/guardar', [
  body('mes_comienzo', 'Ingrese un mes de comienzo').trim().exists().not().isEmpty(),
  body('mes_culminacion', 'Ingrese un mes de culminacion').trim().exists().not().isEmpty(),
  body('anio_periodo', 'Ingrese un anio').trim().exists().not().isEmpty()
], periodoController.guardar);
router.post('/periodo/modificar', periodoController.modificar);

//------Matricula
router.post('/matriculas/guardar', [
  body('fecha_registro', 'Ingrese una fecha').trim().exists().not().isEmpty(),
], matriculaController.guardar);
router.post('/matriculas/modificar', matriculaController.modificar);
//
router.post('/ciclo/guardar', cicloController.guardar);
router.get('/ciclo/listar', cicloController.listar);
//
router.post('/asignatura/guardar', asignaturaController.guardar);
router.post('/asignatura/modificar', asignaturaController.modificar);
router.get('/asignatura/listar', asignaturaController.listar);
router.get('/asignatura/obtener/:external', asignaturaController.obtener);
///Practicas
router.post('/practica/guardar', practicaController.guardar);
router.post('/practica/modificar', practicaController.modificar);
router.get('/practica/listar', practicaController.listar);
router.get('/practica/obtener/:external', practicaController.obtener);
module.exports = router;  