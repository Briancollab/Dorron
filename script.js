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

    boton.disabled = true;

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
            const errorText = await respuesta.text();
            throw new Error(
                `Servidor ${respuesta.status}: ${errorText}`
            );
        }

        const datos = await respuesta.json();

        console.log("Respuesta completa de Dorrón:", datos);

        // =====================================================
        // BUSCAR LOS ARCHIVOS GENERADOS POR LA IA
        // =====================================================

        const files = datos?.response?.files;

        if (!Array.isArray(files) || files.length === 0) {
            throw new Error(
                "La IA no devolvió archivos para la web."
            );
        }

        console.log("Archivos generados:", files);

        // Buscar index.html
        const indexFile =
            files.find(file => file.path === "index.html") ||
            files.find(file =>
                file.path?.toLowerCase().endsWith("index.html")
            );

        if (!indexFile || !indexFile.content) {
            throw new Error(
                "La IA no devolvió un index.html válido."
            );
        }

        // =====================================================
        // CONSTRUIR LA WEB REAL
        // =====================================================

        let html = indexFile.content;

        // Buscar CSS generado por la IA
        const cssFiles = files.filter(file =>
            file.path?.toLowerCase().endsWith(".css")
        );

        // Si la IA generó CSS separado, introducirlo en el HTML
        if (cssFiles.length > 0) {
            const css = cssFiles
                .map(file => file.content || "")
                .join("\n");

            const styleTag = `<style>\n${css}\n</style>`;

            if (html.includes("</head>")) {
                html = html.replace(
                    "</head>",
                    `${styleTag}\n</head>`
                );
            } else {
                html = `${styleTag}\n${html}`;
            }
        }

        // Buscar JS generado por la IA
        const jsFiles = files.filter(file =>
            file.path?.toLowerCase().endsWith(".js")
        );

        if (jsFiles.length > 0) {
            const js = jsFiles
                .map(file => file.content || "")
                .join("\n");

            const scriptTag = `<script>\n${js}\n</script>`;

            if (html.includes("</body>")) {
                html = html.replace(
                    "</body>",
                    `${scriptTag}\n</body>`
                );
            } else {
                html += scriptTag;
            }
        }

        console.log("HTML final enviado a Preview:", html);

        // =====================================================
        // MOSTRAR LA WEB REAL
        // =====================================================

        preview.srcdoc = html;

        loading.style.display = "none";
        resultado.style.display = "block";

    } catch (error) {
        console.error("Error de Dorrón:", error);

        loading.style.display = "block";
        resultado.style.display = "none";

        estado.textContent = "❌ " + error.message;

    } finally {
        boton.disabled = false;
    }
});
