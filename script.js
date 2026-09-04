const API_URL =
    "https://dorron-api-backend--brianstiven608.replit.app";


// ============================================================
// DOM
// ============================================================

const boton = document.getElementById("generar");
const caja = document.getElementById("peticion");
const loading = document.getElementById("loading");
const resultado = document.getElementById("resultado");
const estado = document.getElementById("estado");
const preview = document.getElementById("webPreview");
const app = document.querySelector(".app");
const conversation = document.querySelector(".conversation");


// ============================================================
// CODE / FILE EXPLORER
// ============================================================

const codeView = document.getElementById("codeView");
const codeTool = document.getElementById("codeTool");
const closeCode = document.getElementById("closeCode");
const fileTree = document.getElementById("fileTree");
const codeEditor = document.getElementById("codeEditor");
const editorLanguage = document.getElementById("editorLanguage");
const editorPath = document.getElementById("editorPath");
const activeFileTab = document.getElementById("activeFileTab");
const newFileButton = document.getElementById("newFile");
const newFolderButton = document.getElementById("newFolder");


// ============================================================
// LANGUAGE DETECTION
// ============================================================

const LANGUAGE_BY_EXTENSION = {
    html: "HTML",
    htm: "HTML",

    css: "CSS",

    js: "JavaScript",
    mjs: "JavaScript",
    cjs: "JavaScript",

    jsx: "JSX",

    ts: "TypeScript",

    tsx: "TSX",

    json: "JSON",

    md: "Markdown",
    markdown: "Markdown",

    svg: "SVG/XML",
    xml: "XML"
};


// ============================================================
// PROJECT STATE
// ============================================================

let projectFiles = {};
let proyectoCreado = false;

let archivoActual = null;


// ============================================================
// HELPERS
// ============================================================

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function mostrarEstado(texto) {
    if (estado) {
        estado.textContent = texto;
    }
}


function obtenerExtension(ruta) {

    const nombre =
        ruta.split("/").pop() || "";

    const partes =
        nombre.split(".");

    if (partes.length < 2) {
        return "";
    }

    return partes
        .pop()
        .toLowerCase();
}


function detectarLenguaje(ruta) {

    const extension =
        obtenerExtension(ruta);

    return (
        LANGUAGE_BY_EXTENSION[extension] ||
        "Texto"
    );
}


function iconoArchivo(ruta) {

    const extension =
        obtenerExtension(ruta);

    const iconos = {

        html: "◇",
        htm: "◇",

        css: "#",

        js: "JS",
        mjs: "JS",
        cjs: "JS",

        jsx: "⚛",

        ts: "TS",

        tsx: "⚛",

        json: "{}",

        md: "M",
        markdown: "M",

        svg: "◇",
        xml: "</>"
    };

    return iconos[extension] || "·";
}


function escaparHTML(texto) {

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// BUILDER MODE
// ============================================================

function activarModoBuilder() {

    if (!app) {
        return;
    }

    app.classList.add("builder-active");
}


// ============================================================
// CHAT
// ============================================================

function añadirMensajeUsuario(texto) {

    if (!conversation) {
        return;
    }

    const mensaje =
        document.createElement("div");

    mensaje.className =
        "chat-message user-message";

    mensaje.innerHTML = `
        <div class="message-avatar user-avatar">
            Tú
        </div>

        <div class="message-content">
            <strong>Tú</strong>

            <p>${escaparHTML(texto)}</p>
        </div>
    `;

    conversation.appendChild(mensaje);

    conversation.scrollTop =
        conversation.scrollHeight;
}


function añadirMensajeIA(texto) {

    if (!conversation) {
        return null;
    }

    const mensaje =
        document.createElement("div");

    mensaje.className =
        "chat-message ai-message";

    mensaje.innerHTML = `
        <div class="message-avatar">
            D
        </div>

        <div class="message-content">
            <strong>Dorrón IA</strong>

            <p class="ai-status-text">
                ${escaparHTML(texto)}
            </p>
        </div>
    `;

    conversation.appendChild(mensaje);

    conversation.scrollTop =
        conversation.scrollHeight;

    return mensaje;
}


function actualizarMensajeIA(elemento, texto) {

    if (!elemento) {
        return;
    }

    const contenido =
        elemento.querySelector(
            ".ai-status-text"
        );

    if (contenido) {
        contenido.textContent = texto;
    }

    if (conversation) {
        conversation.scrollTop =
            conversation.scrollHeight;
    }
}


// ============================================================
// CODE VIEW
// ============================================================

function renderizarArbolArchivos() {

    if (!fileTree) {
        return;
    }

    fileTree.innerHTML = "";

    const rutas =
        Object.keys(projectFiles).sort(
            (a, b) => a.localeCompare(b)
        );

    if (rutas.length === 0) {

        fileTree.innerHTML = `
            <div style="
                padding:12px;
                color:#555c68;
                font-size:10px;
            ">
                No hay archivos todavía.
            </div>
        `;

        return;
    }

    rutas.forEach(ruta => {

        const item =
            document.createElement("div");

        item.className =
            "file-item";

        if (ruta === archivoActual) {
            item.classList.add("active");
        }

        item.dataset.path = ruta;
        item.dataset.language =
            detectarLenguaje(ruta);

        item.innerHTML = `
            <span class="file-icon">
                ${escaparHTML(iconoArchivo(ruta))}
            </span>

            <span class="file-name">
                ${escaparHTML(ruta)}
            </span>
        `;

        item.addEventListener(
            "click",
            () => seleccionarArchivo(ruta)
        );

        fileTree.appendChild(item);
    });
}


function seleccionarArchivo(ruta) {

    if (!(ruta in projectFiles)) {
        return;
    }

    guardarArchivoActual();

    archivoActual = ruta;

    if (codeEditor) {
        codeEditor.value =
            projectFiles[ruta] || "";
    }

    if (editorLanguage) {
        editorLanguage.textContent =
            detectarLenguaje(ruta);
    }

    if (editorPath) {
        editorPath.textContent =
            ruta;
    }

    if (activeFileTab) {

        const nombre =
            ruta.split("/").pop();

        activeFileTab.innerHTML = `
            <span class="file-icon">
                ${escaparHTML(iconoArchivo(ruta))}
            </span>

            <span>
                ${escaparHTML(nombre)}
            </span>
        `;
    }

    document
        .querySelectorAll(".file-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.path === ruta
            );
        });
}


function guardarArchivoActual() {

    if (!archivoActual || !codeEditor) {
        return;
    }

    projectFiles[archivoActual] =
        codeEditor.value;
}


function abrirCodigo() {

    if (!codeView) {
        return;
    }

    guardarArchivoActual();

    codeView.classList.add("open");

    codeView.setAttribute(
        "aria-hidden",
        "false"
    );

    renderizarArbolArchivos();

    const primeraRuta =
        archivoActual ||
        Object.keys(projectFiles)[0];

    if (primeraRuta) {
        seleccionarArchivo(primeraRuta);
    }
}


function cerrarCodigo() {

    guardarArchivoActual();

    if (!codeView) {
        return;
    }

    codeView.classList.remove("open");

    codeView.setAttribute(
        "aria-hidden",
        "true"
    );
}


// ============================================================
// CREATE FILE
// ============================================================

function crearArchivo() {

    const rutaIntroducida =
        prompt(
            "Ruta del nuevo archivo:",
            "src/App.jsx"
        );

    if (!rutaIntroducida) {
        return;
    }

    const ruta =
        limpiarRuta(rutaIntroducida);

    if (!ruta) {
        alert("Ruta no válida.");
        return;
    }

    if (projectFiles[ruta] !== undefined) {

        alert(
            "Ese archivo ya existe."
        );

        return;
    }

    projectFiles[ruta] = "";

    renderizarArbolArchivos();

    seleccionarArchivo(ruta);
}


// ============================================================
// CREATE FOLDER
// ============================================================

function crearCarpeta() {

    const carpetaIntroducida =
        prompt(
            "Nombre de la carpeta:",
            "src"
        );

    if (!carpetaIntroducida) {
        return;
    }

    const carpeta =
        limpiarRuta(carpetaIntroducida);

    if (!carpeta) {
        alert("Nombre de carpeta no válido.");
        return;
    }

    /*
     * Por ahora una carpeta queda representada
     * mediante un archivo inicial.
     *
     * Más adelante podremos soportar carpetas
     * completamente vacías.
     */

    const archivo =
        `${carpeta}/index.html`;

    if (projectFiles[archivo] === undefined) {
        projectFiles[archivo] = "";
    }

    renderizarArbolArchivos();

    seleccionarArchivo(archivo);
}


// ============================================================
// SAFE PATH
// ============================================================

function limpiarRuta(ruta) {

    return String(ruta)
        .trim()
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")
        .replace(/\/+/g, "/")
        .replace(/\.\./g, "")
        .replace(/^~/, "");
}


// ============================================================
// FILE EDITOR
// ============================================================

if (codeEditor) {

    codeEditor.addEventListener(
        "input",
        () => {

            if (!archivoActual) {
                return;
            }

            projectFiles[archivoActual] =
                codeEditor.value;
        }
    );
}


if (codeTool) {

    codeTool.addEventListener(
        "click",
        abrirCodigo
    );

    codeTool.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                abrirCodigo();
            }
        }
    );
}


if (closeCode) {

    closeCode.addEventListener(
        "click",
        cerrarCodigo
    );
}


if (newFileButton) {

    newFileButton.addEventListener(
        "click",
        crearArchivo
    );
}


if (newFolderButton) {

    newFolderButton.addEventListener(
        "click",
        crearCarpeta
    );
}


// ============================================================
// PROJECT FILES
// ============================================================

function guardarArchivos(files) {

    if (!Array.isArray(files)) {
        return;
    }

    files.forEach(file => {

        if (!file || !file.path) {
            return;
        }

        const ruta =
            limpiarRuta(file.path);

        if (!ruta) {
            return;
        }

        if (file.operation === "delete") {

            delete projectFiles[ruta];

            if (archivoActual === ruta) {
                archivoActual = null;
            }

            return;
        }

        if (
            file.operation === "create" ||
            file.operation === "update"
        ) {

            projectFiles[ruta] =
                typeof file.content === "string"
                    ? file.content
                    : "";
        }
    });

    if (Object.keys(projectFiles).length > 0) {
        proyectoCreado = true;
    }

    renderizarArbolArchivos();

    if (
        !archivoActual &&
        projectFiles["index.html"]
    ) {
        seleccionarArchivo("index.html");
    }
}


function obtenerArchivosParaGemini() {

    guardarArchivoActual();

    return {
        ...projectFiles
    };
}


// ============================================================
// PREVIEW
// ============================================================

function construirPreview(files) {

    if (!Array.isArray(files)) {
        return "";
    }

    const indexFile =
        files.find(
            file =>
                file &&
                file.path === "index.html" &&
                typeof file.content === "string"
        );

    if (!indexFile) {
        return "";
    }

    let html =
        indexFile.content;

    /*
     * Insertamos CSS generado por Dorrón.
     */

    const cssFiles =
        files.filter(
            file =>
                file &&
                typeof file.content === "string" &&
                /\.(css)$/i.test(file.path)
        );

    if (cssFiles.length > 0) {

        const css =
            cssFiles
                .map(file => file.content)
                .join("\n\n");

        const styleTag =
            `<style>\n${css}\n</style>`;

        if (/<\/head>/i.test(html)) {

            html =
                html.replace(
                    /<\/head>/i,
                    `${styleTag}\n</head>`
                );

        } else {

            html =
                `${styleTag}\n${html}`;
        }
    }

    /*
     * Insertamos JavaScript generado.
     */

    const jsFiles =
        files.filter(
            file =>
                file &&
                typeof file.content === "string" &&
                /\.(js|mjs|cjs)$/i.test(file.path)
        );

    if (jsFiles.length > 0) {

        const js =
            jsFiles
                .map(file => file.content)
                .join("\n\n");

        const scriptTag =
            `<script>\n${js}\n<\/script>`;

        if (/<\/body>/i.test(html)) {

            html =
                html.replace(
                    /<\/body>/i,
                    `${scriptTag}\n</body>`
                );

        } else {

            html =
                `${html}\n${scriptTag}`;
        }
    }

    return html;
}


// ============================================================
// EXTRACT FILES FROM API RESPONSE
// ============================================================

function obtenerFilesRespuesta(datos) {

    if (!datos) {
        return [];
    }

    if (
        datos.response &&
        Array.isArray(datos.response.files)
    ) {
        return datos.response.files;
    }

    if (Array.isArray(datos.files)) {
        return datos.files;
    }

    if (
        datos.response &&
        datos.response.files &&
        typeof datos.response.files === "object"
    ) {
        return Object.entries(
            datos.response.files
        ).map(([path, content]) => ({
            path,
            operation: "update",
            content
        }));
    }

    return [];
}


// ============================================================
// SHOW PREVIEW
// ============================================================

function mostrarPreview() {

    if (!resultado || !preview) {
        return;
    }

    resultado.style.display =
        "block";

    preview.style.display =
        "block";

    const empty =
        document.getElementById(
            "empty-preview"
        );

    if (empty) {
        empty.style.display =
            "none";
    }
}


// ============================================================
// GENERATE
// ============================================================

if (boton) {

    boton.addEventListener(
        "click",
        async () => {

            const texto =
                caja
                    ? caja.value.trim()
                    : "";

            if (!texto) {

                if (caja) {
                    caja.focus();
                }

                return;
            }

            boton.disabled = true;

            activarModoBuilder();

            if (loading) {
                loading.style.display =
                    "flex";
            }

            if (resultado) {
                resultado.style.display =
                    "none";
            }

            añadirMensajeUsuario(texto);

            const mensajeIA =
                añadirMensajeIA(
                    "Analizando tu petición..."
                );

            try {

                await esperar(350);

                actualizarMensajeIA(
                    mensajeIA,
                    proyectoCreado
                        ? "Revisando los archivos actuales del proyecto..."
                        : "Analizando la estructura y el diseño que necesitas..."
                );

                mostrarEstado(
                    proyectoCreado
                        ? "Revisando los archivos actuales..."
                        : "Analizando tu petición..."
                );

                await esperar(500);

                actualizarMensajeIA(
                    mensajeIA,
                    proyectoCreado
                        ? "Detectando qué archivos necesitan cambios..."
                        : "Preparando la estructura de la web..."
                );

                mostrarEstado(
                    proyectoCreado
                        ? "Analizando cambios..."
                        : "Preparando estructura..."
                );

                await esperar(500);

                actualizarMensajeIA(
                    mensajeIA,
                    "Diseñando la estructura, estilos y fondo global..."
                );

                mostrarEstado(
                    "Diseñando la web..."
                );

                await esperar(400);

                actualizarMensajeIA(
                    mensajeIA,
                    "Enviando tu petición a Dorrón IA..."
                );

                mostrarEstado(
                    "Enviando petición a la IA..."
                );

                const response =
                    await fetch(
                        `${API_URL}/api/ai`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
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

                actualizarMensajeIA(
                    mensajeIA,
                    "Recibiendo el código g
