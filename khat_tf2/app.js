var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// Para subir archivos al server
var multer = require('multer');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//CORS
const cors = require("cors");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  cors({
    origin: "*"
  })
);


app.use('/', indexRouter);
app.use('/api', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(multer({
  storage: multer.diskStorage({
    destination: './archivos/',
    limits: {flieSize:10 * 1024 * 1024},//maximo 10Mb
    filename: function (req,file,cb) {
      cb(null,`${Date.now()}-${file.originalname}`);
    }
  })
}).single('file'));

/////
// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
var upload = multer({ storage: storage });
//Uploading multiple files 
app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
  const files = req.files
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }
    res.send(files)
 
})
app.post('/guardar/archivo',async(req,res)=>{
  console.log("ya estuvo!!",req.file);
  res.send('Archivo resibido');
});

module.exports = app;