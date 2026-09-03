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

const conversation = document.querySelector(".conversation");

const API_URL =
    "https://dorron-api-backend--brianstiven608.replit.app";

/*
 * Archivos actuales del proyecto.
 *
 * Después de la primera generación se guardan aquí.
 * En las siguientes peticiones se envían a Gemini para
 * que pueda modificar la web existente.
 */
let projectFiles = {};

/*
 * Indica si ya existe una web generada.
 */
let proyectoCreado = false;


/* =========================
   UTILIDADES
========================= */

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function mostrarEstado(texto) {
    if (estado) {
        estado.textContent = texto;
    }
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


/* =========================
   CHAT
========================= */

function añadirMensajeUsuario(texto) {
    if (!conversation) return;

    const mensaje = document.createElement("div");

    mensaje.className = "dorron-user-message";

    mensaje.innerHTML = `
        <div class="dorron-message-bubble">
            ${escaparHTML(texto)}
        </div>
    `;

    conversation.appendChild(mensaje);

    conversation.scrollTop = conversation.scrollHeight;
}

function añadirMensajeIA(texto, tipo = "normal") {
    if (!conversation) return null;

    const mensaje = document.createElement("div");

    mensaje.className = "dorron-ai-message";

    mensaje.innerHTML = `
        <div class="message-avatar">D</div>

        <div class="message-content">
            <strong>Dorrón IA</strong>
            <p class="dorron-ai-text ${tipo}">
                ${escaparHTML(texto)}
            </p>
        </div>
    `;

    conversation.appendChild(mensaje);

    conversation.scrollTop = conversation.scrollHeight;

    return mensaje.querySelector(".dorron-ai-text");
}

function actualizarMensajeIA(elemento, texto) {
    if (!elemento) return;

    elemento.textContent = texto;

    if (conversation) {
        conversation.scrollTop = conversation.scrollHeight;
    }
}

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}


/* =========================
   PREVIEW
========================= */

function construirPreview(files) {
    const indexFile =
        files.find(file =>
            file.path?.toLowerCase() === "index.html"
        ) ||
        files.find(file =>
            file.path?.toLowerCase().endsWith("/index.html")
        );

    if (!indexFile || typeof indexFile.content !== "string") {
        throw new Error(
            "La IA no devolvió un index.html válido."
        );
    }

    let html = indexFile.content;


    /*
     * CSS
     */

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

        if (/<\/head>/i.test(html)) {

            html = html.replace(
                /<\/head>/i,
                `${styleTag}</head>`
            );

        } else {

            html =
                styleTag +
                html;
        }
    }


    /*
     * JavaScript
     */

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

        if (/<\/body>/i.test(html)) {

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


/* =========================
   GUARDAR ARCHIVOS
========================= */

function guardarArchivos(files) {

    for (const file of files) {

        if (!file || !file.path) {
            continue;
        }

        const ruta = file.path;

        if (file.operation === "delete") {

            delete projectFiles[ruta];

        } else if (typeof file.content === "string") {

            projectFiles[ruta] = file.content;
        }
    }

    proyectoCreado =
        Object.keys(projectFiles).length > 0;
}


/* =========================
   OBTENER ARCHIVOS PARA GEMINI
========================= */

function obtenerArchivosParaGemini() {

    if (Object.keys(projectFiles).length === 0) {
        return {};
    }

    return {
        ...projectFiles
    };
}


/* =========================
   BOTÓN
========================= */

console.log("🔥 DORRÓN SCRIPT CARGADO");

if (!boton) {

    console.error(
        "❌ Dorrón no encontró el botón #generar"
    );

} else {

    console.log(
        "✅ Botón Generar encontrado"
    );
}


/* =========================
   GENERACIÓN
========================= */

boton?.addEventListener("click", async () => {

    console.log(
        "💨 DORRÓN: BOTÓN GENERAR PULSADO"
    );


    const texto = caja
        ? caja.value.trim()
        : "";


    if (!texto) {

        mostrarEstado(
            "✏️ Escribe primero qué quieres crear."
        );

        añadirMensajeIA(
            "✏️ Dime qué quieres crear o modificar."
        );

        return;
    }


    /*
     * Señal INMEDIATA
     */

    boton.disabled = true;

    boton.innerHTML =
        "<span>Creando...</span><span>⚡</span>";


    activarModoBuilder();


    if (loading) {
        loading.style.display = "flex";
    }

    if (resultado) {
        resultado.style.display = "none";
    }


    /*
     * Mostrar petición en el chat
     */

    añadirMensajeUsuario(texto);


    /*
     * Crear mensaje de IA
     */

    const mensajeIA =
        añadirMensajeIA(
            proyectoCreado
                ? "🔍 Revisando la web existente..."
                : "🔍 Analizando tu petición..."
        );


    mostrarEstado(
        proyectoCreado
            ? "🔍 Revisando la web existente..."
            : "🔍 Analizando tu petición..."
    );


    console.log(
        "🚀 Petición enviada:",
        texto
    );


    try {

        await esperar(300);


        /*
         * CREACIÓN O MODIFICACIÓN
         */

        if (proyectoCreado) {

            actualizarMensajeIA(
                mensajeIA,
                "📂 Revisando los archivos actuales del proyecto..."
            );

            mostrarEstado(
                "📂 Revisando los archivos actuales..."
            );

        } else {

            actualizarMensajeIA(
                mensajeIA,
                "🧠 Preparando la estructura de la nueva web..."
            );

            mostrarEstado(
                "🧠 Preparando la estructura..."
            );
        }


        await esperar(400);


        actualizarMensajeIA(
            mensajeIA,
            proyectoCreado
                ? "🧠 Analizando qué partes necesitan cambiar..."
                : "🎨 Diseñando la estructura, estilo y fondo..."
        );

        mostrarEstado(
            proyectoCreado
                ? "🧠 Analizando cambios..."
                : "🎨 Diseñando la web..."
        );


        await esperar(400);


        actualizarMensajeIA(
            mensajeIA,
            "📡 Enviando la petición a Dorrón IA..."
        );

        mostrarEstado(
            "📡 Conectando con Gemini..."
        );


        /*
         * PETICIÓN AL BACKEND
         */

        const respuesta = await fetch(
            `${API_URL}/api/ai`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    message: texto,

                    context: {
                        proyectoExistente:
                            proyectoCreado,

                        modo:
                            proyectoCreado
                                ? "modify"
                                : "create"
                    },

                    files:
                        obtenerArchivosParaGemini()
                })
            }
        );


        console.log(
            "📡 HTTP:",
            respuesta.status,
            respuesta.statusText
        );


        if (!respuesta.ok) {

            const errorText =
                await respuesta.text();

            throw new Error(
                `Servidor ${respuesta.status}: ${errorText}`
            );
        }


        /*
         * RESPUESTA GEMINI
         */

        actualizarMensajeIA(
            mensajeIA,
            "📥 Recibiendo el código generado..."
        );

        mostrarEstado(
            "📥 Recibiendo código de Gemini..."
        );


        const datos =
            await respuesta.json();


        console.log(
            "🤖 Respuesta completa:",
            datos
        );


        /*
         * Compatibilidad con la respuesta actual
         */

        const files =
            datos?.response?.files ||
            datos?.files;


        if (
            !Array.isArray(files) ||
            files.length === 0
        ) {

            throw new Error(
                "La IA respondió, pero no devolvió archivos."
            );
        }


        console.log(
            "📦 Archivos recibidos:",
            files
        );


        /*
         * Guardamos los archivos para
         * futuras modificaciones.
         */

        actualizarMensajeIA(
            mensajeIA,
            "📦 Guardando los archivos del proyecto..."
        );

        mostrarEstado(
            "📦 Guardando archivos..."
        );


        guardarArchivos(files);


        /*
         * PREPARAR PREVIEW
         */

        await esperar(300);


        actualizarMensajeIA(
            mensajeIA,
            "🛠️ Preparando la web para la Preview..."
        );

        mostrarEstado(
            "🛠️ Preparando la Preview..."
        );


        const html =
            construirPreview(files);


        console.log(
            "🖥️ HTML preparado:",
            html
        );


        /*
         * RENDERIZAR
         */

        actualizarMensajeIA(
            mensajeIA,
            "🖥️ Renderizando la web..."
        );

        mostrarEstado(
            "🖥️ Renderizando la Preview..."
        );


        preview.srcdoc = html;


        await esperar(700);


        /*
         * FINAL
         */

        actualizarMensajeIA(
            mensajeIA,
            proyectoCreado
                ? "✅ Cambios aplicados y Preview actualizada."
                : "✅ Web creada y Preview lista."
        );


        mostrarEstado(
            proyectoCreado
                ? "✅ Cambios aplicados correctamente."
                : "✅ Web generada correctamente."
        );


        if (loading) {
            loading.style.display = "none";
        }

        if (resultado) {
            resultado.style.display = "block";
        }


        /*
         * Ya existe proyecto.
         * Las próximas peticiones serán modificaciones.
         */

        proyectoCreado = true;


        /*
         * Limpiar caja
         */

        if (caja) {
            caja.value = "";
        }


    } catch (error) {

        console.error(
            "❌ ERROR DE DORRÓN:",
            error
        );


        actualizarMensajeIA(
            mensajeIA,
            "❌ No pude completar la petición."
        );


        mostrarEstado(
            "❌ " + error.message
        );


        if (loading) {
            loading.style.display = "flex";
        }

        if (resultado) {
            resultado.style.display = "none";
        }


    } finally {

        boton.disabled = false;

        boton.innerHTML =
            "<span>Generar</span><span>↑</span>";
    }
});
