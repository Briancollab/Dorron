let boton = document.getElementById("generar");
let caja = document.getElementById("peticion");
let preview = document.getElementById("webPreview");

boton.addEventListener("click", function() {

    let texto = caja.value;

    if (texto.trim() === "") {
        return;
    }

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

});
