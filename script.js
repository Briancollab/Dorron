let boton = document.getElementById("generar");
let caja = document.getElementById("peticion");

let loading = document.getElementById("loading");
let resultado = document.getElementById("resultado");
let estado = document.getElementById("estado");
let preview = document.getElementById("webPreview");

boton.addEventListener("click", async function() {

    let texto = caja.value.trim();

    if (texto === "") {
        return;
    }

    loading.style.display = "block";
    resultado.style.display = "none";
    estado.textContent = "Conectando con Dorrón...";

    try {

        let respuesta = await fetch("https://dorron.onrender.com/");

        let datos = await respuesta.json();

        estado.textContent = datos.message;

        setTimeout(function() {
            loading.style.display = "none";
            resultado.style.display = "block";

            preview.srcdoc = `
                <html>
                    <body style="font-family: Arial; padding: 40px; text-align: center;">
                        <h1>${texto}</h1>
                        <p>${datos.message}</p>
                    </body>
                </html>
            `;

        }, 1000);

    } catch (error) {

        loading.style.display = "block";
        estado.textContent = "❌ No se pudo conectar con el servidor.";

        console.error(error);
    }

});
