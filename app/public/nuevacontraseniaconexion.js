// Obtener el token de la URL
const token = window.location.pathname; // Extrae el token de la ruta

console.log("Token recibido:", token);
document.getElementById('nueva-contrasenia-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const contrasenia = document.getElementById('contrasenia').value;
    const contrasenia_confirmar = document.getElementById('contrasenia_confirmar').value;

    if (contrasenia !== contrasenia_confirmar) {
        alert('Las contraseñas no coinciden');
    }

    fetch(`/api/cambiar_contrasenia/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contrasenia })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Contraseña cambiada exitosamente');
            } else {
                alert('Error al cambiar la contraseña');
            }
        });
});