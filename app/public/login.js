const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById("login-formulario").addEventListener("submit", async (e) =>{
    e.preventDefault();
    const correo_form = document.getElementById("correo").value;
    const contrasenia_form = document.getElementById("contrasenia").value;

    // Conectando al Backend
    const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            correo : correo_form,
            contrasenia : contrasenia_form
        })
    });
    if (!res.ok) {
        const data = await res.JSON();
        mensajeError.textContent = data.message;
        return mensajeError.classList.toggle("escondido", false)
    }
    const resJson = await res.json();
    if(resJson.redirect){
        window.location.href = resJson.redirect;
    }

});