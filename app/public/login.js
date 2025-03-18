

const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById("login-formulario").addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo_form = document.getElementById("correo").value;
    const contrasenia_form = document.getElementById("contrasenia").value;
    const captcha_value = document.querySelector("#captcha-form").value;  // Valor del CAPTCHA

    // Validación de campos vacíos
    if (!correo_form || !contrasenia_form || !captcha_value) {
        mensajeError.textContent = "Todos los campos son obligatorios.";
        return mensajeError.classList.toggle("escondido", false);  // Mostrar error
    }

    // Conectando al Backend
    const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            correo : correo_form,
            contrasenia : contrasenia_form,
            captcha : captcha_value  // Enviar CAPTCHA
        })
    });
    if (!res.ok) {
        const data = await res.json();
        mensajeError.textContent = data.message || "Error desconocido, intentalo nuevamente.";
        return mensajeError.classList.toggle("escondido", false);
    }
    const resJson = await res.json();
    if (resJson.redirect) {
        window.location.href = resJson.redirect;
    }


});
function mostrarContrasenia() {
    const constrasenia = document.getElementById("contrasenia");
    const ojo = document.getElementById("ojo");

    if (constrasenia.type === "password") {
        constrasenia.type = "text";
        ojo.src = "images/eye-open.svg"; // Cambia a la imagen de ojo abierto
    } else {
        constrasenia.type = "password";
        ojo.src = "images/eye-close.svg"; // Cambia a la imagen de ojo cerrado
        
    }
}
//Para el captcha
document.addEventListener("DOMContentLoaded", function () {
    const fonts = ["cursive", "sans-serif", "serif", "monospace"];
    let captchavalue = "";

    function generarCaptcha() {
        captchavalue = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    function setCaptcha() {
        const preview = document.querySelector(".captcha .preview");
        if (!preview) {
            console.error("Error: No se encontró el elemento .captcha .preview");
            return;
        }

        let html = captchavalue.split("").map((char) => {
            const rotate = -20 + Math.trunc(Math.random() * 40);
            const font = Math.trunc(Math.random() * fonts.length);
            return `<span
            style="display:inline-block;
            transform:rotate(${rotate}deg);
            font-family:${fonts[font]};
            font-size:22px;
            color:#333;
            margin: 0 2px;
            "
            >${char}</span>`;
        }).join("");

        preview.innerHTML = html;
    }

    function initCaptcha() {
        const refreshButton = document.querySelector(".captcha .captcha-refresh");

        if (!refreshButton) {
            console.error("Error: No se encontró el botón de refresco del captcha");
            return;
        }

        refreshButton.addEventListener("click", function () {
            generarCaptcha();
            setCaptcha();
        });

        generarCaptcha();
        setCaptcha();
    }

    initCaptcha();
    document.querySelector(".card_button").addEventListener("click", function() {
        const inputCaptcha = document.querySelector("#captcha-form");  // Cambié la selección a ID

        if (!inputCaptcha) {
            console.error("No se encontró el campo de entrada para el CAPTCHA.");
            return;
        }

        let inputCaptchavalue = inputCaptcha.value;

        if (inputCaptchavalue === captchavalue) {
            // Redirigir a pagina_usuario.html si el captcha es correcto
            window.location.href = "/pagina_usuario";
        } else {
            // Limpiar el campo de entrada del captcha
        inputCaptcha.value = "";

        // Generar un nuevo CAPTCHA
        generarCaptcha();
        setCaptcha();
        }
    
    });
});