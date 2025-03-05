console.log("Entro a validadcion contraseña");
const contrasenia = document.getElementById("constrasenia");
const confirmaContrasenia = document.getElementById("repite_contrasenia");

function validarContraseniaRepetida() {
    const errorMensaje = document.getElementById("errorMensaje");
    if (confirmaContrasenia.value !== contrasenia.value) {
        errorMensaje.style.display = "block"; // Muestra el mensaje de error
    } else {
        errorMensaje.style.display = "none"; // Oculta el mensaje de error
    }
}
// Ejecutar la validación mientras escribe
confirmaContrasenia.addEventListener("input", validarContraseniaRepetida);

// Ejecutar la validación al salir del input
confirmaContrasenia.addEventListener("blur", validarContraseniaRepetida);

// Validar que la contrasenia cumpla con los requisitos
function validarContrasenia() {
    const errorMensaje = document.getElementById("errorMensaje2");
    const valor = contrasenia.value;
    let errores = [];

    if (!/[a-z]/.test(valor)) errores.push("Debe tener al menos una minúscula.");
    if (!/[A-Z]/.test(valor)) errores.push("Debe tener al menos una mayúscula.");
    if (!/\d/.test(valor)) errores.push("Debe tener al menos un número.");
    if (!/[^a-zA-Z0-9]/.test(valor)) errores.push("Debe tener al menos un carácter especial.");
    if (valor.length < 8) errores.push("Debe tener mínimo 8 caracteres.");
    if (valor.length > 15) errores.push("No debe superar los 15 caracteres.");

    if (errores.length === 0) {
        console.log("Entro 0")
        errorMensaje.textContent = "¡Contraseña válida!";
        errorMensaje.classList.add("valido");
    } else {
        console.log("Entro 1")
        errorMensaje.textContent = errores[0]; // Solo muestra el primer error
        errorMensaje.style.display = "block";
        errorMensaje.classList.remove("valido");
    }
}

contrasenia.addEventListener("input", validarContrasenia);
contrasenia.addEventListener("blur", validarContrasenia);