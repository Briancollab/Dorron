let boton = document.getElementById("generar");
let caja = document.getElementById("peticion");

let loading = document.getElementById("loading");
let resultado = document.getElementById("resultado");
let estado = document.getElementById("estado");
let preview = document.getElementById("webPreview");

boton.addEventListener("click", function() {

    let texto = caja.value;

    if (texto.trim() === "") {
        return;
    }

    // Ocultar la vista previa
    resultado.style.display = "none";

    // Mostrar la animación
    loading.style.display = "block";

    estado.textContent = "Analizando tu petición...";

    setTimeout(function() {
        estado.textContent = "Diseñando la estructura...";
    }, 700);

    setTimeout(function() {
        estado.textContent = "Generando código...";
    }, 1400);

    setTimeout(function() {

        let web = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 40px;
                        text-align: center;
                    }

                    button {
                        padding: 12px 20px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                    }
                </style>
            </head>

            <body>

                <h1>${texto}</h1>

                <p>Esta es una web creada por Dorrón 🚀</p>

                <button>Empezar</button>

            </body>
            </html>
        `;

        preview.srcdoc = web;

        // Ocultar animación
        loading.style.display = "none";

        // Mostrar vista previa
        resultado.style.display = "block";

    }, 2000);

});
