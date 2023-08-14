var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');

const { body, validationResult,isDate } = require('express-validator');
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
const CursaController  = require('../controls/CursaController');
var cursaController  = new CursaController();
const EntregaController  = require('../controls/EntregaController');
var entregaController  = new EntregaController();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

var auth = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  if (token) {
    require('dotenv').config();
    const llave = process.env.KEY;
    console.log(llave)
    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        res.status(401);
        res.json({
          msg: "Token no valido",
          code: 401
        });
      } else {
        var models = require('../models');
        var cuenta = models.cuenta;
        req.decoded = decoded;
        let aux = await cuenta.findOne({ 
          where: { 
            external_id: req.decoded.external 
          } 
        })
        if (aux === null) {
          res.status(401);
          res.json({
            msg: "Token no valido o expirado",
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
      msg: "No existe token",
      code: 401
    });
  }

};
// Imagenes usuarios
const storage_foto_persona = ()=>multer.diskStorage({
 
  destination: path.join(__dirname,'../public/images/users'),
  filename: (req, file, cb) => {
    console.log(file);
    const partes = file.originalname.split('.');
    const extension = partes[partes.length - 1];
    cb(null, uuid.v4()+"."+extension);
  }
 
});

const extensiones_aceptadas_foto = (req, file, cb) => {
  const allowedExtensions = ['.jpeg','.jpg', '.png'];
  console.log(file);
  const ext = path.extname(file.originalname);
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPEG, JPG y PNG.'));
  }
};

const upload_foto_persona = multer({ storage: storage_foto_persona(), fileFilter: extensiones_aceptadas_foto });
// Archivos
const storage_archivo = (dir) => multer.diskStorage({
  destination: path.join(__dirname,'../public/archivos'+dir),
  filename: (req, file, cb) => {
    const partes = file.originalname.split('.');
    const extension = partes[partes.length - 1];
    cb(null, uuid.v4()+"."+extension);
  }

 
});

const extensiones_aceptadas_archivo = (req, file, cb) => {
 // console.log("Extenciones");
  //console.log(req);
 // console.log("kkkkkkk");
 // console.log(cb);
  const allowedExtensions = ['.pdf','.docx', '.xlsx'];
  const ext = path.extname(file.originalname);
  console.log("estoy aca");
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF, DOCX y XLSX.'));
  }
};

const upload_archivo_practica = multer({ storage: storage_archivo('/practicas'),fileFilter: extensiones_aceptadas_archivo});
const upload_archivo_entrega = multer({ storage: storage_archivo('/entregas'),fileFilter: extensiones_aceptadas_archivo});
//Practicas
router.post('/guardar/practica', upload_archivo_practica.single('file'), practicaController.guardar);
router.get('/listar/practica/cursa/:external_cursa',practicaController.listar_practicas);
router.get('/listar/entrega/practica/:external',practicaController.listar_practicas_entregadas);
//Entregas
router.post('/calificar/entrega',entregaController.calificar);
router.get('/obtener/entrega/practica/:external',entregaController.obtener_entregas);
router.get('/listar/entrega/docente/:',entregaController.obtener_entregas_docente);
router.post('/entregar/practica', upload_archivo_entrega.single('file'),entregaController.entregar_practica);
///Cuenta
router.post('/login', [
  body('correo', 'Ingrese un correo').trim().exists().not().isEmpty().isEmail(),
  body('clave', 'Ingrese una clave').trim().exists().not().isEmpty(),
], cuentaController.sesion);
//Persona
router.post('/personas/guardar', upload_foto_persona.single('foto'), personaController.guardar);
router.put('/personas/actualizar', auth, upload_foto_persona.single('foto'), personaController.modificar);
router.get('/personas/listar', auth,personaController.listar);
router.get('/personas/obtener/:external',  auth,personaController.obtener);
router.get('/obtener/estudiante/persona/:identificacion', personaRolController.obtener_estudiante);
router.get('/listar/docente/rol', personaRolController.listar_docentes);
//Rol
router.post('/persona_rol/guardar',personaController.asignarRol);
router.post('/rol/guardar', rolController.guardar);
router.get('/rol/listar', rolController.listar);
//Periodo
router.get('/listar/periodo', periodoController.listar);
router.get('/listar/activo/periodo', periodoController.listar_activo);
router.get('/listar/desactivo/periodo', periodoController.listar_desactivo);
router.get('/obtener/periodo', periodoController.obtener);
router.post('/guardar/periodo', [
  body('comienzo', 'Ingrese una fecha de comienzo válida').isDate(),
  body('culminacion', 'Ingrese una fecha de culminación válida').isDate()
], periodoController.guardar);
router.post('/modificar/estado/periodo', periodoController.cambiarEstado);
//Matricula
router.post('/guardar/matricula',matriculaController.guardar);
router.post('/modificar/estado/matricula',matriculaController.cambiar_estado);
router.get('/obtener/matricula', matriculaController.obtener);
router.get('/listar/matricula', matriculaController.listar);
//Ciclo
router.post('/guardar/ciclo',cicloController.guardar);
router.get('/obtener/ciclo',cicloController.obtener);
router.get('/listar/ciclo', cicloController.listar);
//Asignatura
router.post('/guardar/asignatura',asignaturaController.guardar);
router.get('/obtener/asignatura/:external',asignaturaController.obtener);
router.get('/listar/asignatura', asignaturaController.listar);
router.post('/modificar/estado/asignatura',asignaturaController.cambiar_estado);
//Cursa
router.post('/guardar/cursa',cursaController.guardar);
router.get('/obtener/cursa/:external_id',cursaController.obtener);
router.get('/obtener/docente/cursa/:external_id',cursaController.obtener_docente);
router.get('/listar/cursa', cursaController.listar);
router.get('/listar/docente/cursa', cursaController.listar_docentes);
router.post('/modificar/estado/cursa',cursaController.cambiar_estado);
router.post('/asignar/docente',cursaController.crear_cupos);
router.get('/listar/asignatura/cursa',cursaController.obtener_asignatura);
router.post('/asignar/matricula/cursa',cursaController.asignar_matricula);
router.post('/listar/estudiantes/asignatura/cursa',cursaController.obtener_listado_estudiantes);
router.get('/listar/asignaturas/estudiantes/cursa/:id_persona',cursaController.obtener_asignaturas_estudiantes);
router.get('/listar/asignaturas/docentes/cursa/:cedula_docente',cursaController.obtener_asignaturas_docente);
router.post('/obtener/cursa/external/cursa',cursaController.obtener_cursa);
//Laboratorio
router.get('/peticion/codigo/:comando',practicaController.listarCodigos);
module.exports = router;  