const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById("olvidasteContrasenia").addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita que envie el formulario para realizar pruebas
    console.log(e);
    const correo_form = document.getElementById("correo_form").value;

    // Conectando con el backend
    const res = await fetch("http://localhost:4000/api/recuperarContrasenia", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            correo: correo_form,
        })
    });
    if (!res.ok) {
        const data = await res.json();
        mensajeError.textContent = data.message;
        return mensajeError.classList.toggle("escondido", false)
    };

    const resJson = await res.json();

    if (resJson.message) {
        alert(resJson.message);
        window.location.href = '/';
    }
});