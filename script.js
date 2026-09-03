const boton = document.getElementById("generar");
const caja = document.getElementById("peticion");

const loading = document.getElementById("loading");
const resultado = document.getElementById("resultado");
const estado = document.getElementById("estado");
const preview = document.getElementById("webPreview");

const API_URL = "https://dorron-api-backend--brianstiven608.replit.app";

// Elementos de la interfaz
const app = document.querySelector(".app");
const workspace = document.querySelector(".workspace");
const aiPanel = document.querySelector(".ai-panel");
const previewArea = document.querySelector(".preview-area");

let proyectoGenerado = false;

function mostrarEstado(texto) {
    if (estado) {
        estado.textContent = texto;
    }
}

function activarModoBuilder() {
    if (!app) return;

    app.classList.add("builder-active");

    if (workspace) {
        workspace.classList.add("builder-workspace");
    }

    if (aiPanel) {
        aiPanel.classList.add("builder-chat");
    }

    if (previewArea) {
        previewArea.classList.add("builder-preview");
    }
}

function construirPreview(files) {
    const indexFile =
        files.find(file => file.path === "index.html") ||
        files.find(file =>
            file.path?.toLowerCase().endsWith("/index.html")
        );

    if (!indexFile || typeof indexFile.content !== "string") {
        throw new Error("La IA no devolvió un index.html válido.");
    }

    let html = indexFile.content;

    // Añadir los CSS generados por la IA
    const cssFiles = files.filter(file =>
        file.operation !== "delete" &&
        file.path?.toLowerCase().endsWith(".css") &&
        typeof file.content === "string"
    );

    if (cssFiles.length > 0) {
        const css = cssFiles
            .map(file => file.content)
            .join("\n\n");

        const styleTag = `
<style>
${css}
</style>
`;

        if (html.toLowerCase().includes("</head>")) {
            html = html.replace(/<\/head>/i, `${styleTag}</head>`);
        } else {
            html = `${styleTag}${html}`;
        }
    }

    // Añadir los JavaScript generados por la IA
    const jsFiles = files.filter(file =>
        file.operation !== "delete" &&
        file.path?.toLowerCase().endsWith(".js") &&
        typeof file.content === "string"
    );

    if (jsFiles.length > 0) {
        const js = jsFiles
            .map(file => file.content)
            .join("\n\n");

        const scriptTag = `
<script>
${js}
</script>
`;

        if (html.toLowerCase().includes("</body>")) {
            html = html.replace(/<\/body>/i, `${scriptTag}</body>`);
        } else {
            html += scriptTag;
        }
    }

    return html;
}

boton.addEventListener("click", async () => {
    const texto = caja.value.trim();

    if (!texto) return;

    // Cambiar inmediatamente a la interfaz de builder
    activarModoBuilder();

    proyectoGenerado = true;

    loading.style.display = "block";
    resultado.style.display = "none";

    boton.disabled = true;

    try {
        mostrarEstado("🔍 Analizando tu petición...");
        await esperar(500);

        mostrarEstado("🧠 Dorrón IA está diseñando la estructura...");
        await esperar(500);

        mostrarEstado("🎨 Diseñando el estilo y el fondo global...");
        await esperar(500);

        mostrarEstado("💻 Generando HTML, CSS y JavaScript...");
        await esperar(500);

        mostrarEstado("📦 Preparando los archivos del proyecto...");

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

        mostrarEstado("📥 Recibiendo el código generado...");

        const datos = await respuesta.json();

        console.log("Respuesta completa de Dorrón:", datos);

        const files = datos?.response?.files;

        if (!Array.isArray(files) || files.length === 0) {
            throw new Error(
                "La IA no devolvió archivos para la web."
            );
        }

        mostrarEstado("🖥️ Preparando la Preview...");

        const html = construirPreview(files);

        preview.srcdoc = html;

        await esperar(700);

        mostrarEstado("✅ Web generada correctamente.");

        loading.style.display = "none";
        resultado.style.display = "block";

    } catch (error) {
        console.error("Error de Dorrón:", error);

        loading.style.display = "block";
        resultado.style.display = "none";

        mostrarEstado("❌ " + error.message);

    } finally {
        boton.disabled = false;
    }
});

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
