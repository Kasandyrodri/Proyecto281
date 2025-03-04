import jsonwebtoken from "jsonwebtoken"; // Para generar token
import dotenv from "dotenv"; // Genera variables de entorno, que no estaran a la vista del usuario final
import { usuarios } from "./../controllers/authentication.controler.js";

dotenv.config();

// Autorizacion de Paginas
function soloUsuario(req, res, next) {
    const logueado = revisarCookie(req);
    if (logueado) return next();
    return res.redirect("/");
}

function soloPublico(req, res, next) {
    const logueado = revisarCookie(req);
    if (!logueado) return next();
    return res.redirect("/pagina_usuario");
}
function revisarCookie(req) {
    try {
        const cookieJWT = req.headers.cookie.split("; ").find(cookie => cookie.startsWith("jwt=")).slice(4);
        const decodificada = jsonwebtoken.verify(cookieJWT, process.env.JWT_SECRET);
        console.log(decodificada)
        // Verifica si no existe el usuario
        const usuarioARevisar = usuarios.find(usuario => usuario.correo === decodificada.correo);
        if (!usuarioARevisar) {
            return false;
        }
        return true;
    }
    catch {
        return false;
    }
}
export const methods = {
    soloUsuario,
    soloPublico,
}