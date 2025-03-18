import express from "express";
import cookieParser from "cookie-parser"; // Para leer cookies

// Configuracion para el __dirname
import path from 'path';
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/* Si no colocalos type="module se coloca:
import {Express} from "express";"*/

// Importando el controlador para el backend
import { methods as authentication } from "./controllers/authentication.controler.js"
import { methods as authorization } from "./middlewares/authorization.js"

// Servidor //
const app = express();
app.set("port", 4000); // Conexion para el puerto
app.listen(app.get("port")); // Escucha del puerto
console.log("servidor corriendo en puerto", app.get("port")); // prueba

// Conexion de la base de datos
/*
import mysql from 'mysql';
var conexion = mysql.createConnection({
    host: 'localhost',
    database: 'academica',
    user: 'root',
    password: ''
});
conexion.connect(function(error){
    if(error){
        throw error;
    }else{
        console.log('CONEXION EXITOSA');
    }
})
*/

// Configuracion //
app.use(express.static(__dirname + "/public")); // Para acceder a los archivos de public
app.use(express.json()); // Para habilitar los JSON
app.use(cookieParser()); // Para habilitar la lectura de las cookies

// ===== Definir Rutas ===== // // Se coloca __dirname ya que pusimos type: "models"
app.get("/", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/index.html"));//para la pagina principal
app.get("/login", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/login.html")); //endpoint: request, response
app.get("/registro", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/registro.html"));
app.get("/pagina_usuario", authorization.soloUsuario, (req, res) => res.sendFile(__dirname + "/pages/pagina_usuario.html"));
app.get("/recupera_contrasenia", (req, res) => res.sendFile(__dirname + "/pages/recupera_contrasenia.html"));

// Rutas para el backend

app.post("/api/registro", authentication.registro, (req, res) => {
    // Si la autenticación es exitosa, redirige a la página de login o cualquier otra página
    res.redirect('/registro'); // Puedes cambiar a otra página después del login, como '/pagina_usuario'
});
app.post("/api/login", authentication.login, (req, res) => {
    // Si la autenticación es exitosa, redirige a la página de login o cualquier otra página
    res.redirect('/login'); // Puedes cambiar a otra página después del login, como '/pagina_usuario'
});
app.post("/api/recuperarContrasenia", authentication.verificarContrasenia, (req, res) => {
    // Si la autenticación es exitosa, redirige a la página de login o cualquier otra página
    res.redirect('/'); // Puedes cambiar a otra página después del login, como '/pagina_usuario'
});

// Middlewares: Codigo entre el request y el response
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
<<<<<<< HEAD
  });


=======
});
>>>>>>> cb6d3ffc194a47f89d6ae7c63ae86af22dd53414
app.get("/verificar/:token", authentication.verificarCuenta);

app.get("/cambiar_contrasenia/:token", (req, res) => res.sendFile(__dirname + "/pages/nuevaContraseniaForm.html"));
app.post("/api/cambiar_contrasenia", authentication.cambiarContrasenia);