var express = require('express');
var router = express.Router();

const { body } = require('express-validator');

const RolController = require('../controls/rolController');
var rolController = new RolController();

const PersonaController = require('../controls/personaController');
var personaController = new PersonaController();

const AutoController = require('../controls/autoController');
var autoController = new AutoController();

const MarcaController = require('../controls/marcaController');
var marcaController = new MarcaController();

const DetalleFacturaController = require('../controls/detalleFacturaController');
var detalleFacturaController = new DetalleFacturaController();

const FacturaController = require('../controls/facturaController');
var facturaController = new FacturaController();

const CuentaController = require('../controls/cuentaController');
var cuentaController = new CuentaController();

const OrdenController = require('../controls/ordenController');
var ordenController = new OrdenController();

const RepuestoController = require('../controls/repuestoController');
var repuestoController = new RepuestoController();

const DetalleOrdenController = require('../controls/detalleOrdenController');
var detalleOrdenController = new DetalleOrdenController();

const Auto_personaController = require('../controls/auto_personaController');
var auto_personaController = new Auto_personaController();
let jwt = require('jsonwebtoken');


//Middleware
var auth = async function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  console.log(req.headers);
  console.log(token);

  if (!token) {
    return res.status(401).json({
      msg: "No existe el token!",
      code: 401
    })
  }

  require('dotenv').config();
  const llave = process.env.KEY;
  jwt.verify(token, llave, async (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).json({
        msg: "Token no válido o expirado",
        code: 401
      })
    }
    var models = require('../models');
    var cuenta = models.cuenta;
    req.decoded = decoded;
    let aux = await cuenta.findOne({
      where: {
        externalId: req.decoded.external
      }
    })

    if (aux === null) {
      return res.status(401).json({
        msg: "Token no validoo",
        code: 401
      })
    }
    next();
    

  })
}

/* GET users listing. */
router.get('/', function (req, res) {
  res.json({ "version": "1.0", "name": "auto" });
  res.send('respond with a resource');
});

router.get('/roles/', rolController.listar);

router.post('/personas/guardar', [
  body('nombres', 'Ingrese sus nombres').trim().exists().not().isEmpty().isLength({ min: 3, max: 100 }).withMessage("Ingrese un valor mayor a 3 y menor a 100"),
  body('apellidos', 'Ingrese sus apellidos').exists().not().isEmpty().withMessage("Faltan apellidos")
],
  personaController.guardar);

router.get('/personas/listar', auth,personaController.listar);
router.get('/personas/obtener/:external',auth, personaController.obtener);

//router.get('/login/:correo/:clave', personaController.login);

router.post('/marcas/guardar', marcaController.guardar);
router.get('/marcas/listar', marcaController.listar);

router.post('/autos/guardar', autoController.guardar);
router.post('/autos/obtener', autoController.obtener);
router.get('/autos/listar', autoController.listar);
router.put('/autos/actualizar', autoController.actualizar);
router.delete('/autos/borrar', autoController.eliminar);

router.post('/orden/guardar', ordenController.guardar);
router.post('/orden/obtener', ordenController.obtener);

router.post('/detalleOrden/guardar', detalleOrdenController.guardar);

router.post('/repuestos/guardar', repuestoController.guardar);
router.get('/repuestos/listar', repuestoController.listar);

router.get('/auto_persona/listar', auto_personaController.listar);
router.post('/auto_persona/obtener', auto_personaController.obtener);

router.post('/detalleFactura/guardar', detalleFacturaController.guardar);
router.post('/facturas/guardar', facturaController.guardar);
router.get('/facturas/listar', facturaController.listar);


router.post('/login', [
  body('correo', 'Ingrese un correo valido').isEmail(),
  body('clave', 'Ingrese una clave').trim().exists().not().isEmpty()
],
  cuentaController.sesion);
module.exports = router;
