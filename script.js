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
// CODE VIEW
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
// LANGUAGES
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


function escaparHTML(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function limpiarRuta(ruta) {
    return String(ruta)
        .trim()
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")
        .replace(/\/+/g, "/")
        .replace(/\.\./g, "")
        .replace(/^~/, "");
}


function obtenerExtension(ruta) {
    const nombre = ruta.split("/").pop() || "";
    const partes = nombre.split(".");

    if (partes.length < 2) {
        return "";
    }

    return partes.pop().toLowerCase();
}


function detectarLenguaje(ruta) {
    const extension = obtenerExtension(ruta);

    return (
        LANGUAGE_BY_EXTENSION[extension] ||
        "Texto"
    );
}


function iconoArchivo(ruta) {
    const extension = obtenerExtension(ruta);

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


// ============================================================
// BUILDER MODE
// ============================================================

function activarModoBuilder() {

    if (app) {
        app.classList.add("builder-active");
    }
}


// ============================================================
// CHAT
// ============================================================

function añadirMensajeUsuario(texto) {

    if (!conversation) {
        return;
    }

    const mensaje = document.createElement("div");

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
// FILE TREE
// ============================================================

function construirArbol(rutas) {

    const raiz = {
        tipo: "folder",
        nombre: "",
        ruta: "",
        hijos: {}
    };

    rutas.forEach(ruta => {

        const partes =
            ruta.split("/").filter(Boolean);

        let actual = raiz;

        partes.forEach(
            (parte, index) => {

                const esArchivo =
                    index === partes.length - 1;

                if (!actual.hijos[parte]) {

                    actual.hijos[parte] = {

                        tipo: esArchivo
                            ? "file"
                            : "folder",

                        nombre: parte,

                        ruta:
                            partes
                                .slice(
                                    0,
                                    index + 1
                                )
                                .join("/"),

                        hijos: {}
                    };
                }

                actual =
                    actual.hijos[parte];
            }
        );
    });

    return raiz;
}


function renderizarArbolArchivos() {

    if (!fileTree) {
        return;
    }

    fileTree.innerHTML = "";

    const rutas =
        Object.keys(projectFiles)
            .filter(
                ruta =>
                    ruta &&
                    !ruta.endsWith("/")
            )
            .sort(
                (a, b) =>
                    a.localeCompare(b)
            );

    if (rutas.length === 0) {

        fileTree.innerHTML = `
            <div class="empty-file-tree">
                No hay archivos todavía.
            </div>
        `;

        return;
    }

    const arbol =
        construirArbol(rutas);

    renderizarCarpeta(
        arbol,
        fileTree
    );
}


function renderizarCarpeta(
    carpeta,
    contenedor
) {

    const elementos =
        Object.values(carpeta.hijos)
            .sort((a, b) => {

                if (
                    a.tipo === "folder" &&
                    b.tipo !== "folder"
                ) {
                    return -1;
                }

                if (
                    a.tipo !== "folder" &&
                    b.tipo === "folder"
                ) {
                    return 1;
                }

                return a.nombre.localeCompare(
                    b.nombre
                );
            });


    elementos.forEach(elemento => {

        // ----------------------------------------------------
        // FOLDER
        // ----------------------------------------------------

        if (elemento.tipo === "folder") {

            const carpetaElemento =
                document.createElement("div");

            carpetaElemento.className =
                "folder-item";


            const contenidoCarpeta =
                document.createElement("div");

            contenidoCarpeta.className =
                "folder-content";

            contenidoCarpeta.innerHTML = `
                <span class="folder-arrow">
                    ▾
                </span>

                <span class="folder-icon">
                    📁
                </span>

                <span class="folder-name">
                    ${escaparHTML(
                        elemento.nombre
                    )}
                </span>
            `;


            const hijos =
                document.createElement("div");

            hijos.className =
                "folder-children";


            carpetaElemento.appendChild(
                contenidoCarpeta
            );

            carpetaElemento.appendChild(
                hijos
            );

            contenedor.appendChild(
                carpetaElemento
            );


            let abierta = true;


            contenidoCarpeta.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    abierta = !abierta;

                    hijos.style.display =
                        abierta
                            ? "block"
                            : "none";

                    const flecha =
                        contenidoCarpeta
                            .querySelector(
                                ".folder-arrow"
                            );

                    if (flecha) {

                        flecha.textContent =
                            abierta
                                ? "▾"
                                : "▸";
                    }
                }
            );


            renderizarCarpeta(
                elemento,
                hijos
            );

            return;
        }


        // ----------------------------------------------------
        // FILE
        // ----------------------------------------------------

        const item =
            document.createElement("div");

        item.className =
            "file-item";


        if (
            elemento.ruta ===
            archivoActual
        ) {
            item.classList.add("active");
        }


        item.dataset.path =
            elemento.ruta;

        item.dataset.language =
            detectarLenguaje(
                elemento.ruta
            );


        item.innerHTML = `
            <span class="file-icon">
                ${escaparHTML(
                    iconoArchivo(
                        elemento.ruta
                    )
                )}
            </span>

            <span class="file-name">
                ${escaparHTML(
                    elemento.nombre
                )}
            </span>
        `;


        item.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                seleccionarArchivo(
                    elemento.ruta
                );
            }
        );


        contenedor.appendChild(item);
    });
}


// ============================================================
// SELECT FILE
// ============================================================

function seleccionarArchivo(ruta) {

    if (
        !Object.prototype.hasOwnProperty.call(
            projectFiles,
            ruta
        )
    ) {
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
                ${escaparHTML(
                    iconoArchivo(ruta)
                )}
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


// ============================================================
// SAVE CURRENT FILE
// ============================================================

function guardarArchivoActual() {

    if (
        !archivoActual ||
        !codeEditor
    ) {
        return;
    }

    projectFiles[archivoActual] =
        codeEditor.value;
}


// ============================================================
// OPEN / CLOSE CODE
// ============================================================

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


    const rutas =
        Object.keys(projectFiles);


    if (!archivoActual && rutas.length) {

        seleccionarArchivo(
            rutas[0]
        );

    } else if (archivoActual) {

        seleccionarArchivo(
            archivoActual
        );
    }
}


function cerrarCodigo() {

    guardarArchivoActual();

    if (!codeView) {
        return;
    }

    codeView.classList.remove(
        "open"
    );

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
        limpiarRuta(
            rutaIntroducida
        );


    if (!ruta) {

        alert(
            "La ruta no es válida."
        );

        return;
    }


    if (
        Object.prototype.hasOwnProperty.call(
            projectFiles,
            ruta
        )
    ) {

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
            "Ruta de la nueva carpeta:",
            "src/components"
        );

    if (!carpetaIntroducida) {
        return;
    }


    const carpeta =
        limpiarRuta(
            carpetaIntroducida
        );


    if (!carpeta) {

        alert(
            "El nombre de la carpeta no es válido."
        );

        return;
    }


    /*
     * Como el sistema actual almacena archivos
     * mediante rutas, creamos un archivo inicial
     * para que la carpeta exista.
     */

    const archivoInicial =
        `${carpeta}/index.html`;


    if (
        !Object.prototype.hasOwnProperty.call(
            projectFiles,
            archivoInicial
        )
    ) {

        projectFiles[
            archivoInicial
        ] = "";
    }


    renderizarArbolArchivos();

    seleccionarArchivo(
        archivoInicial
    );
}


// ============================================================
// EDITOR INPUT
// ============================================================

if (codeEditor) {

    codeEditor.addEventListener(
        "input",
        () => {

            if (!archivoActual) {
                return;
            }

            projectFiles[
                archivoActual
            ] = codeEditor.value;
        }
    );
}


// ============================================================
// CODE BUTTONS
// ============================================================

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
// SAVE FILES FROM GEMINI
// ============================================================

function guardarArchivos(files) {

    if (!Array.isArray(files)) {
        return;
    }


    files.forEach(file => {

        if (
            !file ||
            !file.path
        ) {
            return;
        }


        const ruta =
            limpiarRuta(
                file.path
            );


        if (!ruta) {
            return;
        }


        // DELETE

        if (
            file.operation ===
            "delete"
        ) {

            delete projectFiles[ruta];


            if (
                archivoActual ===
                ruta
            ) {
                archivoActual = null;
            }


            return;
        }


        // CREATE / UPDATE

        if (
            file.operation === "create" ||
            file.operation === "update"
        ) {

            projectFiles[ruta] =
                typeof file.content ===
                "string"
                    ? file.content
                    : "";
        }
    });


    if (
        Object.keys(projectFiles)
            .length > 0
    ) {

        proyectoCreado = true;
    }


    renderizarArbolArchivos();


    if (
        !archivoActual &&
        projectFiles["index.html"]
    ) {

        seleccionarArchivo(
            "index.html"
        );
    }
}


// ============================================================
// SEND PROJECT TO GEMINI
// ============================================================

function obtenerArchivosParaGemini() {

    guardarArchivoActual();

    return {
        ...projectFiles
    };
}


// ============================================================
// BUILD PREVIEW
// ============================================================

function construirPreview(files) {

    if (!Array.isArray(files)) {
        return "";
    }


    const indexFile =
        files.find(
            file =>
                file &&
                file.path ===
                    "index.html" &&
                typeof file.content ===
                    "string"
        );


    if (!indexFile) {
        return "";
    }


    let html =
        indexFile.content;


    // --------------------------------------------------------
    // CSS
    // --------------------------------------------------------

    const cssFiles =
        files.filter(
            file =>
                file &&
                typeof file.content ===
                    "string" &&
                /\.css$/i.test(
                    file.path
                )
        );


    if (cssFiles.length > 0) {

        const css =
                        
