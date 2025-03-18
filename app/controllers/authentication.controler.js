import bcryptjs from "bcryptjs"; // Para encriptar los datos
import jsonwebtoken from "jsonwebtoken"; // Para generar token
import dotenv from "dotenv"; // Genera variables de entorno, que no estaran a la vista del usuario final
import { enviarMailRecuperacion, enviarMailVerificacion } from "../services/mail.service.js"; // exportamos las funciones de mail.service.js

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

        console.log('usuarios:', usuarios);
        // ===== Enviar el email de verificacion al cliente ===== //
        const email = await enviarMailVerificacion(correo, tokenVerificacion);

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
        console.log('usuarios:', usuarios);
        return res.status(201).send({ status: "ok", message: `Usuario ${nuevoUsuario.nombre} creado, por favor, verifique la cuenta desde su correo electronico`, redirect: "/login" });
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
        //Generamos la Cookie

        res.cookie("jwt", token, cookieOption);
        console.log("USUARIO VERIFICADO")
        res.redirect("/");

    } catch (err) {
        res.status(500);
        res.redirect("/");
    }
}

async function verificarContrasenia(req, res) {
    const correo = req.body.correo;

    // Verificar que existe el correo en la base de datos (si no existe el usuario)
    const usuarioARevisar = usuarios.find(usuario => usuario.correo === correo);
    if (!usuarioARevisar) {
        return res.status(400).send({ status: "Error", message: "El usuario no esta registrado!!" });
    }
    // Generar un token de recuperación de contraseña
    const tokenVerificacion = jsonwebtoken.sign(
        { correo: correo },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION });

    // Configurar el transporte de Nodemailer
    // ===== Enviar el email de verificación al cliente ===== //
    try {
        const email = await enviarMailRecuperacion(correo, tokenVerificacion);
        if (email.accepted.length === 0) {
            return res.status(500).json({ status: "Error", message: "Error al enviar el email de verificación" });
        }

        // Respuesta de éxito, se envió el correo
        return res.json({ status: "Success", message: "Se le envió un email a su correo para restablecer su contraseña" });
    } catch (error) {
        console.error("Error al enviar el correo: ", error);
        return res.status(500).json({ status: "Error", message: "Hubo un problema al enviar el correo" });
    }

}
async function cambiarContrasenia(req, res) {
    try {
        const token = req.body.token; // Ahora recuperamos el token desde el cuerpo de la solicitud

        if (!token) {
            return res.status(400).json({ success: false, message: 'Token no proporcionado' });
        }

        // Verificamos el token
        const decodificada = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        if (!decodificada || !decodificada.correo) {
            return res.json({ status: "error", message: "Error del token" });
        }

        // Actualizamos la variable de verificado para que pueda ingresar el usuario.
        const indexUsuarioActualizar = usuarios.findIndex(usuario => usuario.correo === decodificada.correo);

        // Encriptando la contrasenia del usuario: Encriptando 5 veces
        const salt = await bcryptjs.genSalt(5);
        const hashPassword = await bcryptjs.hash(req.body.contrasenia, salt);

        // Cambiando la contrasenia del usuario
        usuarios[indexUsuarioActualizar].contrasenia = hashPassword;
        return res.json({ status: "Success", message: "Contraseña cambiada con éxito :D" });

    } catch (err) {
        return res.json({ status: "error", message: "Error al cambiar la contraseña" });
    }
}

export const methods = {
    login,
    registro,
    verificarCuenta,
    verificarContrasenia,
    cambiarContrasenia
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
