
const boton = document.getElementById("generar");
const caja = document.getElementById("peticion");

const loading = document.getElementById("loading");
const resultado = document.getElementById("resultado");
const estado = document.getElementById("estado");
const preview = document.getElementById("webPreview");

const API_URL = "https://dorron-api-backend--brianstiven608.replit.app";

boton.addEventListener("click", async () => {
    const texto = caja.value.trim();

    if (!texto) return;

    loading.style.display = "block";
    resultado.style.display = "none";
    estado.textContent = "Conectando con Dorrón IA...";

    try {
        estado.textContent = "Dorrón está creando tu web...";

        const respuesta = await fetch(`${API_URL}/api/ai`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: texto
            })
        });

        if (!respuesta.ok) {
            throw new Error(`Error del servidor: ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        console.log("Respuesta de Dorrón:", datos);

        /*
         * El backend puede devolver el código generado
         * en distintos campos. Intentamos los más habituales.
         */
        const codigo =
            datos.html ||
            datos.code ||
            datos.content ||
            datos.output;

        if (!codigo) {
            throw new Error("La IA no devolvió código HTML.");
        }

        loading.style.display = "none";
        resultado.style.display = "block";

        preview.srcdoc = codigo;

    } catch (error) {
    console.error("Error:", error);

    loading.style.display = "block";
    estado.textContent = "❌ Error: " + error.message;
    }
});
