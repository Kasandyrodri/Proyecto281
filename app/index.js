import express from "express";
import cookieParser from "cookie-parser"; // Para leer cookies

// Configuracion para el __dirname
import path from 'path';
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/* Si no colocalos type="module se coloca:
import {Express} from "express";"*/

// Importando el controlador para el backend
import {methods as authentication} from "./controllers/authentication.controler.js"
import {methods as authorization} from "./middlewares/authorization.js"

// Servidor //
const app = express();
app.set("port", 4000); // Conexion para el puerto
app.listen(app.get("port")); // Escucha del puerto
console.log("servidor corriendo en puerto", app.get("port")); // prueba

// Configuracion //
app.use(express.static(__dirname + "/public")); // Para acceder a los archivos de public
app.use(express.json()); // Para habilitar los JSON
app.use(cookieParser()); // Para habilitar la lectura de las cookies

// ===== Definir Rutas ===== // // Se coloca __dirname ya que pusimos type: "models"
app.get("/", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/login.html")); //endpoint: request, response
app.get("/registro", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/registro.html"));
app.get("/pagina_usuario", authorization.soloUsuario, (req, res) => res.sendFile(__dirname + "/pages/pagina_usuario.html"));

// Rutas para el backend
app.post("/api/registro", authentication.registro);
app.post("/api/login", authentication.login);


// Middlewares: Codigo entre el request y el response
