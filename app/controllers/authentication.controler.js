import bcryptjs from "bcryptjs"; // Para encriptar los datos
import jsonwebtoken from "jsonwebtoken"; // Para generar token
import dotenv from "dotenv"; // Genera variables de entorno, que no estaran a la vista del usuario final
import { enviarMailVerificacion } from "../services/mail.service.js";

// Para acceder a las variables de entorno:
dotenv.config();

export const usuarios = [{
    nombre: 'Yoel',
    paterno: 'Ticona',
    materno: 'Laura',
    correo: 'yoelticonalaura1@gmail.com',
    fecha_nacimiento: '2001-04-18',
    pais: 'Bolivia',
    ciudad: 'La Paz',
    contrasenia: '$2b$05$pvr6v/MpT1Eq2E8tx0QgD.J7KjnVXPiezYzKU7Fksx2uSrmgEqej.'
    // contrasenia = 123456
}]
async function login(req, res) {
    console.log(req.body);
    const correo = req.body.correo;
    const contrasenia = req.body.contrasenia;

    // Verifica que los campos esten llenos
    if (!correo || !contrasenia) {
        return res.status(400).send({ status: "Error", message: "Los campos estan incompletos" })
    }
    // Verifica si no existe el usuario
    const usuarioARevisar = usuarios.find(usuario => usuario.correo === correo);
    if (!usuarioARevisar) {
        return res.status(400).send({ status: "Error", message: "Error durante el inicio de sesion" });
    }
    const SesionCorrecta = await bcryptjs.compare(contrasenia, usuarioARevisar.contrasenia);

    // Token de autorizacion: Clave para el usuario para autorización
    if (!SesionCorrecta) {
        return res.status(400).send({ status: "Error", message: "Error durante el inicio de sesion" });
    }

    // Token para el inicio de sesion
    // Le da una etiqueta (token) para que ingrese a su cuenta
    const token = jsonwebtoken.sign(
        { correo: usuarioARevisar.correo },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION });

        // Envio del token por medio de cookie al usuario
        const cookieOption = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            path: "/"
        }
        //Generamos la Cookie
        res.cookie("jwt", token, cookieOption);
        res.send({status: "ok", message:"Usuario Loggeado", redirect:"/pagina_usuario"}); // Enviamos al usuario

}

async function registro(req, res) {
    console.log(req.body);
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
    const usuarioARevisar = usuarios.find(usuario => usuario.correo === correo);
    if (usuarioARevisar) {
        return res.status(400).send({ status: "Error", message: "Este correo ya se encuentra registrado" });
    }

    // Verifica que las contrasenias sean las mismas
    console.log(contrasenia);
    console.log(verifica_contrasenia);
    if (!(contrasenia === verifica_contrasenia)) {
        return res.status(400).send({ status: "Error", message: "Verifique que las contraseñas sean las mismas" });
    }
    else {
        // Encriptando la contrasenia del usuario
        // Encriptando 5 veces
        const salt = await bcryptjs.genSalt(5);
        const hashPassword = await bcryptjs.hash(contrasenia, salt);

        // Enviar el email de verificacion al cliente
        //const email =  await enviarMailVerificacion(correo, "TOKEN DE PRUEBA");

        // Creando el nuevo usuario
        const nuevoUsuario = {
            nombre, paterno, materno,
            correo, fecha_nacimiento, pais,
            ciudad,
            contrasenia: hashPassword
        }
        usuarios.push(nuevoUsuario);
        console.log("USUARIOS:", usuarios);
        return res.status(201).send({ status: "ok", message: `Usuario ${nuevoUsuario.nombre} creado`, redirect: "/" });
    }

}

export const methods = {
    login,
    registro
}