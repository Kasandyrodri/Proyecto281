const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById("registro-formulario").addEventListener("submit", async (e)=>{
    e.preventDefault(); // Evita que envie el formulario para realizar pruebas
    console.log(e);
    const nombre_form = document.getElementById("nombre").value;
    const paterno_form = document.getElementById("paterno").value;
    const materno_form = document.getElementById("materno").value;
    const correo_form = document.getElementById("correo").value;
    const fecha_nacimiento_form = document.getElementById("fecha_nacimiento").value;
    const pais_form = document.getElementById("pais").value;
    const ciudad_form = document.getElementById("ciudad").value;
    const contrasenia_form = document.getElementById("constrasenia").value;
    const verifica_contrasenia_form = document.getElementById("repite_contrasenia").value;

    // Conectando con el backend
    const res = await fetch("http://localhost:4000/api/registro", {
        method: "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            nombre: nombre_form,
            paterno: paterno_form,
            materno: materno_form,
            correo : correo_form,
            fecha_nacimiento : fecha_nacimiento_form,
            pais : pais_form,
            ciudad : ciudad_form,
            contrasenia : contrasenia_form,
            verifica_contrasenia : verifica_contrasenia_form
        })
    });
    if (!res.ok) {
        const data = await res.json();
        mensajeError.textContent = data.message;
        return mensajeError.classList.toggle("escondido", false)
    };
    const resJson = await res.json();
    if (resJson.redirect){
        window.location.href = resJson.redirect;
    }
});