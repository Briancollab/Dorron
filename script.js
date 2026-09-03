const boton = document.getElementById("generar");
const caja = document.getElementById("peticion");

const loading = document.getElementById("loading");
const resultado = document.getElementById("resultado");
const estado = document.getElementById("estado");
const preview = document.getElementById("webPreview");

const app = document.querySelector(".app");
const workspace = document.querySelector(".workspace");
const aiPanel = document.querySelector(".ai-panel");
const previewArea = document.querySelector(".preview-area");

const API_URL = "https://dorron-api-backend--brianstiven608.replit.app";

function mostrarEstado(texto) {
    if (estado) {
        estado.textContent = texto;
    }
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function activarModoBuilder() {
    if (app) {
        app.classList.add("builder-active");
    }

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

    // CSS generado por la IA
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
            html = html.replace(
                /<\/head>/i,
                `${styleTag}</head>`
            );
        } else {
            html = `${styleTag}${html}`;
        }
    }

    // JavaScript generado por la IA
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
            html = html.replace(
                /<\/body>/i,
                `${scriptTag}</body>`
            );
        } else {
            html += scriptTag;
        }
    }

    return html;
}

// Comprobación visible de que el script está cargado
console.log("🔥 DORRÓN SCRIPT CARGADO");

if (!boton) {
    console.error("❌ No se encontró el botón Generar.");
} else {
    console.log("✅ Botón Generar encontrado.");
}

boton?.addEventListener("click", async () => {

    console.log("💨 DORRÓN: BOTÓN GENERAR PULSADO");

    const texto = caja.value.trim();

    if (!texto) {
        mostrarEstado("✏️ Escribe primero qué quieres crear.");
        return;
    }

    // SEÑAL INMEDIATA
    boton.disabled = true;
    boton.innerHTML = "<span>Creando...</span><span>⚡</span>";

    loading.style.display = "flex";
    resultado.style.display = "none";

    mostrarEstado("⚡ Dorrón ha recibido tu petición.");

    // Cambiamos la interfaz inmediatamente
    activarModoBuilder();

    console.log("🚀 Enviando petición a Dorrón IA:", texto);

    try {

        await esperar(300);

        mostrarEstado("🔍 Analizando tu petición...");

        await esperar(500);

        mostrarEstado("🧠 Preparando la generación del proyecto...");

        await esperar(500);

        mostrarEstado("📡 Conectando con Dorrón IA...");

        const respuesta = await fetch(`${API_URL}/api/ai`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: texto
            })
        });

        console.log(
            "📡 Respuesta HTTP:",
            respuesta.status,
            respuesta.statusText
        );

        if (!respuesta.ok) {
            const errorText = await respuesta.text();

            throw new Error(
                `Servidor ${respuesta.status}: ${errorText}`
            );
        }

        mostrarEstado("📥 Recibiendo código de Gemini...");

        const datos = await respuesta.json();

        console.log("🤖 Respuesta completa de Dorrón:", datos);

        const files = datos?.response?.files;

        if (!Array.isArray(files) || files.length === 0) {
            throw new Error(
                "La IA respondió, pero no devolvió archivos."
            );
        }

        console.log("📦 Archivos recibidos:", files);

        mostrarEstado("🛠️ Preparando los archivos de la web...");

        const html = construirPreview(files);

        console.log(
            "🖥️ HTML preparado para Preview:",
            html
        );

        mostrarEstado("🖥️ Renderizando la Preview...");

        preview.srcdoc = html;

        await esperar(700);

        mostrarEstado("✅ Web generada correctamente.");

        loading.style.display = "none";
        resultado.style.display = "block";

    } catch (error) {

        console.error("❌ ERROR DE DORRÓN:", error);

        loading.style.display = "flex";
        resultado.style.display = "none";

        mostrarEstado("❌ " + error.message);

    } finally {

        boton.disabled = false;

        boton.innerHTML = "<span>Generar</span><span>↑</span>";
    }
});
