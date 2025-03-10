import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config();

// Enviando el email
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        correo: process.env.EMAIL_CORREO,
        contrasenia: process.env.EMAIL_PASSWORD
    }

})

// Enviamos el mail
export async function enviarMailVerificacion(direccion, token) {
    transporter.sendMail({
        from: "Bicentenario 2025 <yoelticonalaura@gmail.com>",
        to: direccion,
        subject: "Verificacion de nueva cuenta - Bicentenario 2025",
        html: crearEmailVerificacion(token)
    });
}

function crearEmailVerificacion(token) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <style>
        html {
            background-color: white;
        }

        body {
            max-width: 600px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: auto;
            background-color: rgb(229, 255, 246);
            padding: 40px;
            border-radius: 4px;
            margin-top: 10px;
        }
    </style>

    <body>
        <h1>Verificación de correo electrónico - puntoJson.com</h1>
        <p>Se ha creado una cuenta en puntoJson.com con este correo electrónico.</p>
        <p>Si esta cuenta no fue creada por usted, desestime este correo.</p>
        <p></p>Si usted creó la cuenta, entonces verifique la cuenta <a href="http://localhost:5000/verificar/${token}"
            target="_blank" rel="noopener noreferrer">haciendo click aquí</a>.</p>
        <p><strong>Calo</strong></p>
        <p>CEO PuntoJson.</p>
    </body>
    </html>
    `
}