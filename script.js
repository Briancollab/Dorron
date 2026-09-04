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
let projectFolders = new Set();

let proyectoCreado = false;
let archivoActual = null;
let carpetaActual = "";


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
        .replace(/^~/, "")
        .replace(/\/+$/, "");
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


function obtenerPadre(ruta) {
    const partes = ruta.split("/");

    if (partes.length <= 1) {
        return "";
    }

    partes.pop();

    return partes.join("/");
}


function asegurarCarpetasPadre(ruta) {
    const partes = ruta.split("/");

    if (partes.length <= 1) {
        return;
    }

    partes.pop();

    let actual = "";

    partes.forEach(parte => {

        actual = actual
            ? `${actual}/${parte}`
            : parte;

        projectFolders.add(actual);
    });
}


function existeArchivo(ruta) {
    return Object.prototype.hasOwnProperty.call(
        projectFiles,
        ruta
    );
}


function existeCarpeta(ruta) {
    return projectFolders.has(ruta);
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
// FILE TREE
// ============================================================

function construirArbol() {

    const raiz = {
        tipo: "folder",
        nombre: "",
        ruta: "",
        hijos: {}
    };


    // --------------------------------------------------------
    // CARPETAS
    // --------------------------------------------------------

    Array.from(projectFolders)
        .filter(Boolean)
        .forEach(ruta => {

            const partes =
                ruta.split("/").filter(Boolean);

            let actual = raiz;

            partes.forEach(
                (parte, index) => {

                    const rutaParcial =
                        partes
                            .slice(
                                0,
                                index + 1
                            )
                            .join("/");

                    if (!actual.hijos[parte]) {

                        actual.hijos[parte] = {

                            tipo: "folder",

                            nombre: parte,

                            ruta: rutaParcial,

                            hijos: {}
                        };
                    }

                    actual =
                        actual.hijos[parte];
                }
            );
        });


    // --------------------------------------------------------
    // ARCHIVOS
    // --------------------------------------------------------

    Object.keys(projectFiles)
        .filter(Boolean)
        .forEach(ruta => {

            const partes =
                ruta.split("/").filter(Boolean);

            let actual = raiz;

            partes.forEach(
                (parte, index) => {

                    const esArchivo =
                        index === partes.length - 1;

                    const rutaParcial =
                        partes
                            .slice(
                                0,
                                index + 1
                            )
                            .join("/");


                    if (!actual.hijos[parte]) {

                        actual.hijos[parte] = {

                            tipo:
                                esArchivo
                                    ? "file"
                                    : "folder",

                            nombre: parte,

                            ruta:
                                rutaParcial,

                            hijos: {}
                        };
                    }


                    if (
                        !esArchivo &&
                        actual.hijos[parte].tipo !==
                            "folder"
                    ) {

                        actual.hijos[parte].tipo =
                            "folder";
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


    const tieneArchivos =
        Object.keys(projectFiles).length > 0;

    const tieneCarpetas =
        projectFolders.size > 0;


    if (
        !tieneArchivos &&
        !tieneCarpetas
    ) {

        fileTree.innerHTML = `
            <div class="empty-file-tree">
                No hay archivos todavía.
            </div>
        `;

        return;
    }


    const arbol =
        construirArbol();


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

        // ====================================================
        // FOLDER
        // ====================================================

        if (elemento.tipo === "folder") {

            const carpetaElemento =
                document.createElement("div");

            carpetaElemento.className =
                "folder-item";


            const contenidoCarpeta =
                document.createElement("div");

            contenidoCarpeta.className =
                "folder-content";


            if (
                elemento.ruta ===
                carpetaActual
            ) {
                contenidoCarpeta.classList.add(
                    "active"
                );
            }


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

                    carpetaActual =
                        elemento.ruta;

                    renderizarArbolArchivos();
                }
            );


            contenidoCarpeta.addEventListener(
                "dblclick",
                event => {

                    event.stopPropagation();

                    renombrarCarpeta(
                        elemento.ruta
                    );
                }
            );


            contenidoCarpeta.addEventListener(
                "contextmenu",
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    mostrarMenuCarpeta(
                        elemento.ruta,
                        event.clientX,
                        event.clientY
                    );
                }
            );


            renderizarCarpeta(
                elemento,
                hijos
            );


            contenidoCarpeta.addEventListener(
                "click",
                () => {

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


            return;
        }


        // ====================================================
        // FILE
        // ====================================================

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


        item.addEventListener(
            "dblclick",
            event => {

                event.stopPropagation();

                renombrarArchivo(
                    elemento.ruta
                );
            }
        );


        item.addEventListener(
            "contextmenu",
            event => {

                event.preventDefault();
                event.stopPropagation();

                mostrarMenuArchivo(
                    elemento.ruta,
                    event.clientX,
                    event.clientY
                );
            }
        );


        contenedor.appendChild(item);
    });
}


// ============================================================
// CONTEXT MENU
// ============================================================

function eliminarMenuContextual() {

    const menu =
        document.getElementById(
            "dorron-context-menu"
        );

    if (menu) {
        menu.remove();
    }
}


function crearMenuContextual(
    x,
    y,
    opciones
) {

    eliminarMenuContextual();


    const menu =
        document.createElement("div");

    menu.id =
        "dorron-context-menu";


    menu.style.position =
        "fixed";

    menu.style.left =
        `${x}px`;

    menu.style.top =
        `${y}px`;

    menu.style.zIndex =
        "99999";

    menu.style.background =
        "#11141a";

    menu.style.border =
        "1px solid #292e38";

    menu.style.borderRadius =
        "8px";

    menu.style.padding =
        "5px";

    menu.style.minWidth =
        "150px";

    menu.style.boxShadow =
        "0 12px 30px rgba(0,0,0,.45)";


    opciones.forEach(opcion => {

        const button =
            document.createElement("button");

        button.type =
            "button";

        button.textContent =
            opcion.label;


        button.style.display =
            "block";

        button.style.width =
            "100%";

        button.style.border =
            "0";

        button.style.background =
            "transparent";

        button.style.color =
            opcion.danger
                ? "#ff6b6b"
                : "#dfe3ea";

        button.style.textAlign =
            "left";

        button.style.padding =
            "8px 10px";

        button.style.borderRadius =
            "6px";

        button.style.cursor =
            "pointer";


        button.addEventListener(
            "mouseenter",
            () => {

                button.style.background =
                    "#1b2028";
            }
        );


        button.addEventListener(
            "mouseleave",
            () => {

                button.style.background =
                    "transparent";
            }
        );


        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                eliminarMenuContextual();

                opcion.action();
            }
        );


        menu.appendChild(button);
    });


    document.body.appendChild(menu);


    setTimeout(() => {

        document.addEventListener(
            "click",
            eliminarMenuContextual,
            {
                once: true
            }
        );

    }, 0);
}


function mostrarMenuArchivo(
    ruta,
    x,
    y
) {

    crearMenuContextual(
        x,
        y,
        [
            {
                label: "✏️ Renombrar",
                action: () =>
                    renombrarArchivo(ruta)
            },

            {
                label: "🗑️ Eliminar",
                danger: true,
                action: () =>
                    eliminarArchivo(ruta)
            }
        ]
    );
}


function mostrarMenuCarpeta(
    ruta,
    x,
    y
) {

    crearMenuContextual(
        x,
        y,
        [
            {
                label: "📄 Nuevo archivo",
                action: () =>
                    crearArchivo(ruta)
            },

            {
                label: "📁 Nueva subcarpeta",
                action: () =>
                    crearCarpeta(ruta)
            },

            {
                label: "✏️ Renombrar",
                action: () =>
                    renombrarCarpeta(ruta)
            },

            {
                label: "🗑️ Eliminar carpeta",
                danger: true,
                action: () =>
                    eliminarCarpeta(ruta)
            }
        ]
    );
}


// ============================================================
// SELECT FILE
// ============================================================

function seleccionarArchivo(ruta) {

    if (!existeArchivo(ruta)) {
        return;
    }


    guardarArchivoActual();


    archivoActual =
        ruta;


    carpetaActual =
        obtenerPadre(ru
