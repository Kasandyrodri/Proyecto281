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

// para las ciudades y paises
document.addEventListener("DOMContentLoaded", async function () {
    const paisSelect = document.getElementById("pais");
    const ciudadSelect = document.getElementById("ciudad");

    // 🔹 Obtener lista de países
    async function obtenerPaises() {
        let response = await fetch("https://restcountries.com/v3.1/all");
        let data = await response.json();

        let paises = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        paisSelect.innerHTML = '<option value="">Seleccione un país</option>';
        paises.forEach(pais => {
            let option = document.createElement("option");
            option.value = pais.name.common;
            option.textContent = pais.name.common;
            paisSelect.appendChild(option);
        });
    }

    // 🔹 Obtener ciudades del país seleccionado
    async function obtenerCiudades(paisNombre) {
        let response = await fetch("https://countriesnow.space/api/v0.1/countries");
        let data = await response.json();

        let paisEncontrado = data.data.find(pais => pais.country === paisNombre);
        ciudadSelect.innerHTML = '<option value="">Seleccione una ciudad</option>';

        if (paisEncontrado) {
            paisEncontrado.cities.forEach(ciudad => {
                let option = document.createElement("option");
                option.value = ciudad;
                option.textContent = ciudad;
                ciudadSelect.appendChild(option);
            });
        } else {
            ciudadSelect.innerHTML = '<option value="">No hay ciudades disponibles</option>';
        }
    }

    // 🔹 Llenar lista de países al cargar
    await obtenerPaises();

    // 🔹 Cargar ciudades cuando se seleccione un país
    paisSelect.addEventListener("change", function () {
        if (paisSelect.value) {
            obtenerCiudades(paisSelect.value);
        } else {
            ciudadSelect.innerHTML = '<option value="">Seleccione un país primero</option>';
        }
    });
});
