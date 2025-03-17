import bcryptjs from "bcryptjs"; // Para encriptar los datos
import jsonwebtoken from "jsonwebtoken"; // Para generar token
import dotenv from "dotenv"; // Genera variables de entorno, que no estaran a la vista del usuario final
import { enviarMailVerificacion } from "../services/mail.service.js"; // exportamos las funciones de mail.service.js

dotenv.config(); // Para acceder a las variables de entorno:

// Usuarios para la prueba del codigo
export const usuarios = [{
    nombre: 'Yoel',
    paterno: 'Ticona',
    materno: 'Laura',
    correo: 'yoelticonalaura@gmail.com',
    fecha_nacimiento: '2001-04-18',
    pais: 'Bolivia',
    ciudad: 'La Paz',
    contrasenia: '$2b$05$AXaVLhsiVwRWD8UlfiBmWuJsD.aHkcO.lCMjn8qbWQdhh7eqxttDS', //Bicen123.0
    verificado: true
}]

async function login(req, res) {
    console.log("async function login\n", req.body);
    const correo = req.body.correo;
    const contrasenia = req.body.contrasenia;
    const captcha = req.body.captcha;  // CAPTCHA recibido del cliente

    // Verifica que los campos estén llenos
    if (!correo || !contrasenia || !captcha) {
        return res.status(400).send({ status: "Error", message: "Todos los campos son obligatorios" });
    }

    // Verifica si no existe el usuario
    const usuarioARevisar = usuarios.find(usuario => usuario.correo === correo && usuario.verificado);
    if (!usuarioARevisar) {
        return res.status(400).send({ status: "Error", message: "Error durante el inicio de sesión, usuario no encontrado" });
    }

    // Verifica el CAPTCHA
    if (captcha !== req.body.captcha) {
        return res.status(400).send({ status: "Error", message: "Captcha inválido" });
    }

    // Verifica la contraseña
    const SesionCorrecta = await bcryptjs.compare(contrasenia, usuarioARevisar.contrasenia);
    if (!SesionCorrecta) {
        return res.status(400).send({ status: "Error", message: "Contraseña incorrecta" });
    }

    // Generar el token JWT
    const token = jsonwebtoken.sign(
        { correo: usuarioARevisar.correo },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION });

    // Enviar el token como cookie
    const cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        path: "/"
    };

    res.cookie("jwt", token, cookieOption);
    res.send({ status: "ok", message: "Usuario logueado", redirect: "/pagina_usuario" });
}


async function registro(req, res) {
    console.log("async function registro\n", req.body);
    const nombre = req.body.nombre;
    const paterno = req.body.paterno;
    const materno = req.body.materno
    const correo = req.body.correo
    const fecha_nacimiento = req.body.fecha_nacimiento
    const pais = req.body.pais
    const ciudad = req.body.ciudad
    const contrasenia = req.body.contrasenia
    const verifica_contrasenia = req.body.verifica_contrasenia

    // Verificamos los datos:
    if (!nombre || !paterno || !materno || !correo || !fecha_nacimiento || !pais || !ciudad || !contrasenia || !verifica_contrasenia) {
        return res.status(400).send({ status: "Error", message: "Los campos esta incompletos" });
    }
    // Verifica si existe un usuario con el mismo correo
    const usuarioARevisar = usuarios.find(usuario => usuario.correo === correo && usuario.verificado);
    if (usuarioARevisar) {
        return res.status(400).send({ status: "Error", message: "Este correo ya se encuentra registrado" });
    }
    // Verifica que las contrasenias sean las mismas
    if (!(contrasenia === verifica_contrasenia)) {
        return res.status(400).send({ status: "Error", message: "Verifique que las contraseñas sean las mismas" });
    }
    else {
        // Encriptando la contrasenia del usuario: Encriptando 5 veces
        const salt = await bcryptjs.genSalt(5);
        const hashPassword = await bcryptjs.hash(contrasenia, salt);

        // Crear el token para la verificacion del email
        const tokenVerificacion = jsonwebtoken.sign(
            { correo: correo },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION });

        // ===== Enviar el email de verificacion al cliente ===== //
        const email = await enviarMailVerificacion(correo, tokenVerificacion);
        console.log("email:\n", email);

        if (email.accepted.length === 0) {
            return res.status(500).send({ status: "error", message: "Error al enviar el email de verificación" });
        }
        // Creando el nuevo usuario
        const nuevoUsuario = {
            nombre, paterno, materno,
            correo, fecha_nacimiento, pais,
            ciudad,
            contrasenia: hashPassword,
            verificado: false
        }
        usuarios.push(nuevoUsuario);
        console.log("USUARIOS:", usuarios); //  ============== Cambiar para la base de datos
        return res.status(201).send({ status: "ok", message: `Usuario ${nuevoUsuario.nombre} creado`, redirect: "/login" });
    }

}
function verificarCuenta(req, res) {
    try {
        // Verificamos por medio del token
        if (!req.params.token) {
            return res.redirect("/");
        }

        // Verificamos el token
        const decodificada = jsonwebtoken.verify(req.params.token, process.env.JWT_SECRET);
        if (!decodificada || !decodificada.correo) {
            return res.redirect("/").send({ status: "error", message: "Error del token" });
        }

        // Creamos el token para el inicio de sesion desde el gmail
        const token = jsonwebtoken.sign(
            { correo: decodificada.correo },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION });

        // Envio del token por medio de cookie al usuario
        const cookieOption = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            path: "/"
        }

        // Actualizamos la variable de verificado para que pueda ingresar el usuario.
        const indexUsuarioActualizar = usuarios.findIndex(usuario => usuario.correo === decodificada.correo);
        usuarios[indexUsuarioActualizar].verificado = true;
        console.log("USUARIOSVerificar:", usuarios);
        //Generamos la Cookie

        res.cookie("jwt", token, cookieOption);
        res.redirect("/");

    } catch (err) {
        res.status(500);
        res.redirect("/");
    }
}

export const methods = {
    login,
    registro,
    verificarCuenta
}

//para captcha
export function soloUsuario(req, res, next) {
    if (!req.cookies.jwt) {
        return res.redirect('/login');  // Si no hay token, redirige a login
    }
    // Si hay un token, verifica su validez
    jsonwebtoken.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.redirect('/login'); // Si el token es inválido, redirige a login
        }
        req.usuario = decoded;  // Decodifica la información del token
        next();  // Si es válido, continúa con la ejecución
    });
}
