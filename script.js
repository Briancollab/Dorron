const API_URL =
    "https://dorron-api-backend--brianstiven608.replit.app";


// ============================================================
// DOM
// ============================================================

const app = document.querySelector(".app");

const peticion = document.getElementById("peticion");
const generar = document.getElementById("generar");

const emptyPreview = document.getElementById("empty-preview");
const loading = document.getElementById("loading");
const resultado = document.getElementById("resultado");
const webPreview = document.getElementById("webPreview");
const estado = document.getElementById("estado");
const conversation = document.getElementById("conversation");

const codeTool = document.getElementById("codeTool");
const codeView = document.getElementById("codeView");
const closeCode = document.getElementById("closeCode");

const fileTree = document.getElementById("fileTree");
const codeEditor = document.getElementById("codeEditor");
const editorLanguage = document.getElementById("editorLanguage");
const editorPath = document.getElementById("editorPath");
const activeFileTab = document.getElementById("activeFileTab");

const newFileButton = document.getElementById("newFile");
const newFolderButton = document.getElementById("newFolder");
const saveFileButton = document.getElementById("saveFile");

const importProjectButton =
    document.getElementById("importProject");

const projectFolderInput =
    document.getElementById("projectFolderInput");

const refreshPreview =
    document.getElementById("refreshPreview");


// ============================================================
// PROYECTO
// ============================================================

let projectFiles = {};
let projectAssets = {};
let projectFolders = new Set();

let carpetasAbiertas = new Set();

let proyectoCreado = false;
let archivoActual = null;
let carpetaActual = "";


// ============================================================
// CONFIGURACIÓN DE ARCHIVOS
// ============================================================

const TEXT_EXTENSIONS = new Set([
    "html",
    "htm",
    "css",
    "scss",
    "sass",
    "less",
    "js",
    "mjs",
    "cjs",
    "jsx",
    "ts",
    "tsx",
    "json",
    "md",
    "txt",
    "xml",
    "svg",
    "yml",
    "yaml",
    "vue",
    "svelte",
    "astro",
    "env",
    "gitignore",
    "npmrc",
    "prettierrc",
    "editorconfig"
]);


const LANGUAGE_BY_EXTENSION = {
    html: "HTML",
    htm: "HTML",

    css: "CSS",
    scss: "SCSS",
    sass: "SASS",
    less: "LESS",

    js: "JavaScript",
    mjs: "JavaScript",
    cjs: "JavaScript",

    jsx: "JSX",

    ts: "TypeScript",
    tsx: "TSX",

    json: "JSON",

    md: "Markdown",
    txt: "Texto",

    xml: "XML",
    svg: "SVG",

    yml: "YAML",
    yaml: "YAML",

    vue: "Vue",
    svelte: "Svelte",
    astro: "Astro"
};


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


function limpiarRuta(ruta) {

    if (!ruta) return "";

    return ruta
        .replaceAll("\\", "/")
        .replace(/^\/+/, "")
        .replace(/\.\./g, "")
        .replace(/^~+/, "")
        .replace(/\/+/g, "/")
        .trim();

}


function obtenerExtension(nombre) {

    const limpio = nombre
        .split("/")
        .pop()
        .toLowerCase();

    if (!limpio.includes(".")) {
        return limpio;
    }

    return limpio
        .split(".")
        .pop();

}


function detectarLenguaje(nombre) {

    const extension = obtenerExtension(nombre);

    return LANGUAGE_BY_EXTENSION[extension] || "Texto";

}


function iconoArchivo(nombre) {

    const extension = obtenerExtension(nombre);

    if (["html", "htm"].includes(extension)) {
        return ["◇", "html"];
    }

    if (["css", "scss", "sass", "less"].includes(extension)) {
        return ["#", "css"];
    }

    if (["js", "mjs", "cjs"].includes(extension)) {
        return ["JS", "js"];
    }

    if (["jsx", "tsx"].includes(extension)) {
        return ["⚛", "react"];
    }

    if (extension === "json") {
        return ["{}", "json"];
    }

    if (extension === "md") {
        return ["M", "md"];
    }

    if (extension === "svg") {
        return ["◇", "html"];
    }

    return ["•", ""];
}


function obtenerPadre(ruta) {

    const partes = ruta.split("/");

    partes.pop();

    return partes.join("/");

}


function asegurarCarpetasPadre(ruta) {

    const partes = ruta.split("/");

    partes.pop();

    let acumulada = "";

    for (const parte of partes) {

        if (!parte) continue;

        acumulada = acumulada
            ? `${acumulada}/${parte}`
            : parte;

        projectFolders.add(acumulada);
    }

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


function esArchivoTexto(nombre) {

    const extension = obtenerExtension(nombre);

    return TEXT_EXTENSIONS.has(extension);
}


// ============================================================
// CHAT
// ============================================================

function agregarMensajeUsuario(texto) {

    const wrapper = document.createElement("div");
    wrapper.className = "chat-message user";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";

    bubble.textContent = texto;

    wrapper.appendChild(bubble);

    conversation.appendChild(wrapper);

    conversation.scrollTop = conversation.scrollHeight;
}


function agregarMensajeIA(texto) {

    const wrapper = document.createElement("div");
    wrapper.className = "chat-message";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "D";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";

    bubble.textContent = texto;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    conversation.appendChild(wrapper);

    conversation.scrollTop = conversation.scrollHeight;
}


// ============================================================
// BUILDER MODE
// ============================================================

function activarBuilderMode() {

    if (!app) return;

    app.classList.add("builder-active");
}


function desactivarBuilderMode() {

    if (!app) return;

    app.classList.remove("builder-active");
}


// ============================================================
// CODE VIEW
// ============================================================

function abrirCodeView() {

    if (!codeView) return;

    codeView.classList.add("open");
    codeView.setAttribute("aria-hidden", "false");

    renderizarArbolArchivos();
}


function cerrarCodeView() {

    if (!codeView) return;

    guardarArchivoActual();

    codeView.classList.remove("open");
    codeView.setAttribute("aria-hidden", "true");
}


if (codeTool) {

    codeTool.addEventListener("click", () => {
        abrirCodeView();
    });

    codeTool.addEventListener("keydown", event => {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();
            abrirCodeView();
        }

    });

}


if (closeCode) {

    closeCode.addEventListener(
        "click",
        cerrarCodeView
    );

}


// ============================================================
// ÁRBOL DE ARCHIVOS
// ============================================================

function construirEstructura() {

    const root = {
        folders: {},
        files: []
    };

    for (const carpeta of projectFolders) {

        const partes = carpeta
            .split("/")
            .filter(Boolean);

        let actual = root;

        for (const parte of partes) {

            if (!actual.folders[parte]) {

                actual.folders[parte] = {
                    folders: {},
                    files: [],
                    path: ""
                };

            }

            actual = actual.folders[parte];
        }

    }


    for (const ruta of Object.keys(projectFiles)) {

        const partes = ruta
            .split("/")
            .filter(Boolean);

        const nombre = partes.pop();

        let actual = root;
        let acumulada = "";

        for (const parte of partes) {

            acumulada = acumulada
                ? `${acumulada}/${parte}`
                : parte;

            if (!actual.folders[parte]) {

                actual.folders[parte] = {
                    folders: {},
                    files: [],
                    path: acumulada
                };

            }

            actual = actual.folders[parte];
        }

        actual.files.push({
            name: nombre,
            path: ruta
        });

    }

    return root;
}


function renderizarArbolArchivos() {

    if (!fileTree) return;

    fileTree.innerHTML = "";

    const totalArchivos =
        Object.keys(projectFiles).length +
        Object.keys(projectAssets).length;

    if (
        totalArchivos === 0 &&
        projectFolders.size === 0
    ) {

        const empty = document.createElement("div");

        empty.className = "empty-file-tree";

        empty.textContent =
            "No hay archivos. Importa un proyecto o crea uno.";

        fileTree.appendChild(empty);

        return;
    }


    const estructura = construirEstructura();

    renderizarCarpetas(
        estructura,
        fileTree,
        ""
    );

}


function renderizarCarpetas(
    nodo,
    contenedor,
    rutaPadre
) {

    const carpetas = Object.keys(nodo.folders)
        .sort((a, b) => a.localeCompare(b));

    for (const nombre of carpetas) {

        const carpeta = nodo.folders[nombre];

        const ruta = rutaPadre
            ? `${rutaPadre}/${nombre}`
            : nombre;

        const wrapper =
            document.createElement("div");

        wrapper.className = "folder-item";


        const contenido =
            document.createElement("div");

        contenido.className = "folder-content";


        const flecha =
            document.createElement("span");

        flecha.className = "folder-arrow";


        const icono =
            document.createElement("span");

        icono.className = "folder-icon";
        icono.textContent = "📁";


        const nombreElemento =
            document.createElement("span");

        nombreElemento.className = "folder-name";
        nombreElemento.textContent = nombre;


        contenido.appendChild(flecha);
        contenido.appendChild(icono);
        contenido.appendChild(nombreElemento);


        const hijos =
            document.createElement("div");

        hijos.className = "folder-children";


        const abierta =
            carpetasAbiertas.has(ruta);

        flecha.textContent =
            abierta ? "▾" : "▸";

        hijos.style.display =
            abierta ? "block" : "none";


        contenido.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                carpetaActual = ruta;

                if (carpetasAbiertas.has(ruta)) {
                    carpetasAbiertas.delete(ruta);
                } else {
                    carpetasAbiertas.add(ruta);
                }

                renderizarArbolArchivos();

            }
        );


        contenido.addEventListener(
            "contextmenu",
            event => {

                event.preventDefault();

                mostrarMenuCarpeta(
                    event,
                    ruta
                );

            }
        );


        renderizarCarpetas(
            carpeta,
            hijos,
            ruta
        );


        for (const archivo of carpeta.files) {

            crearElementoArchivo(
                archivo.path,
                hijos
            );

        }


        wrapper.appendChild(contenido);
        wrapper.appendChild(hijos);

        contenedor.appendChild(wrapper);

    }


    const archivosRaiz =
        [...nodo.files]
            .sort((a, b) =>
                a.name.localeCompare(b.name)
            );


    for (const archivo of archivosRaiz) {

        crearElementoArchivo(
            archivo.path,
            contenedor
        );

    }

}


function crearElementoArchivo(
    ruta,
    contenedor
) {

    const elemento =
        document.createElement("div");

    elemento.className = "file-item";

    if (ruta === archivoActual) {
        elemento.classList.add("active");
    }

    elemento.dataset.path = ruta;
    elemento.dataset.language =
        detectarLenguaje(ruta);


    const [simbolo, clase] =
        iconoArchivo(ruta);


    const icono =
        document.createElement("span");

    icono.className =
        `file-icon ${clase}`;

    icono.textContent = simbolo;


    const nombre =
        document.createElement("span");

    nombre.className = "file-name";

    nombre.textContent =
        ruta.split("/").pop();


    elemento.appendChild(icono);
    elemento.appendChild(nombre);


    elemento.addEventListener(
        "click",
        () => {

            seleccionarArchivo(ruta);

        }
    );


    elemento.addEventListener(
        "contextmenu",
        event => {

            event.preventDefault();

            mostrarMenuArchivo(
                event,
                ruta
            );

        }
    );


    contenedor.appendChild(elemento);

}


// ============================================================
// SELECCIONAR ARCHIVO
// ============================================================

function seleccionarArchivo(ruta) {

    guardarArchivoActual();

    if (!existeArchivo(ruta)) return;

    archivoActual = ruta;

    codeEditor.value =
        projectFiles[ruta] || "";

    editorLanguage.textContent =
        detectarLenguaje(ruta);

    editorPath.textContent =
        ruta;

    activeFileTab.innerHTML = "";

    const [simbolo, clase] =
        iconoArchivo(ruta);

    const icono =
        document.createElement("span");

    icono.className =
        `file-icon ${clase}`;

    icono.textContent =
        simbolo;


    const nombre =
        document.createElement("span");

    nombre.textContent =
        ruta.split("/").pop();


    activeFileTab.appendChild(icono);
    activeFileTab.appendChild(nombre);

    renderizarArbolArchivos();

}


// ============================================================
// GUARDAR ARCHIVO
// ============================================================

function guardarArchivoActual() {

    if (!archivoActual) return;

    projectFiles[archivoActual] =
        codeEditor.value;

}


if (saveFileButton) {

    saveFileButton.addEventListener(
        "click",
        () => {

            guardarArchivoActual();

            agregarMensajeIA(
                `💾 Guardado: ${archivoActual}`
            );

        }
    );

}


// ============================================================
// CREAR ARCHIVO
// ============================================================

function crearArchivo(carpetaDestino = "") {

    let nombre =
        prompt(
            "Nombre del archivo:",
            ""
        );

    if (!nombre) return;

    nombre = limpiarRuta(nombre);

    if (!nombre) return;

    if (
        !nombre.includes("/") &&
        carpetaDestino
    ) {
        nombre =
            `${carpetaDestino}/${nombre}`;
    }

    if (existeArchivo(nombre)) {

        alert("Ese archivo ya existe.");

        return;
    }

    projectFiles[nombre] = "";

    asegurarCarpetasPadre(nombre);

    proyectoCreado = true;

    const padre =
        obtenerPadre(nombre);

    if (padre) {
        carpetasAbiertas.add(padre);
    }

    renderizarArbolArchivos();

    seleccionarArchivo(nombre);

}


if (newFileButton) {

    newFileButton.addEventListener(
        "click",
        () => crearArchivo(carpetaActual)
    );

}


// ============================================================
// CREAR CARPETA
// ============================================================

function crearCarpeta() {

    let nombre =
        prompt(
            "Nombre de la carpeta:",
            ""
        );

    if (!nombre) return;

    nombre = limpiarRuta(nombre);

    if (!nombre) return;

    if (
        carpetaActual &&
        !nombre.includes("/")
    ) {
        nombre =
            `${carpetaActual}/${nombre}`;
    }

    if (existeCarpeta(nombre)) {

        alert("Esa carpeta ya existe.");

        return;
    }

    projectFolders.add(nombre);

    carpetasAbiertas.add(
        obtenerPadre(nombre)
    );

    carpetasAbiertas.add(nombre);

    proyectoCreado = true;

    renderizarArbolArchivos();

}


if (newFolderButton) {

    newFolderButton.addEventListener(
        "click",
        crearCarpeta
    );

}


// ============================================================
// RENOMBRAR ARCHIVO
// ============================================================

function renombrarArchivo(ruta) {

    const viejoNombre =
        ruta.split("/").pop();

    let nuevoNombre =
        prompt(
            "Nuevo nombre:",
            viejoNombre
        );

    if (!nuevoNombre) return;

    nuevoNombre =
        limpiarRuta(nuevoNombre);

    if (!nuevoNombre) return;

    const padre =
        obtenerPadre(ruta);

    const nuevaRuta =
        padre
            ? `${padre}/${nuevoNombre}`
            : nuevoNombre;

    if (
        nuevaRuta !== ruta &&
        existeArchivo(nuevaRuta)
    ) {

        alert("Ese archivo ya existe.");

        return;
    }

    projectFiles[nuevaRuta] =
        projectFiles[ruta];

    delete projectFiles[ruta];

    if (archivoActual === ruta) {
        archivoActual = nuevaRuta;
    }

    renderizarArbolArchivos();

    seleccionarArchivo(nuevaRuta);

}


// ============================================================
// RENOMBRAR CARPETA
// ============================================================

function renombrarCarpeta(ruta) {

    const viejoNombre =
        ruta.split("/").pop();

    let nuevoNombre =
        prompt(
            "Nuevo nombre:",
            viejoNombre
        );

    if (!nuevoNombre) return;

    nuevoNombre =
        limpiarRuta(nuevoNombre);

    if (!nuevoNombre) return;

    const padre =
        obtenerPadre(ruta);

    const nuevaRuta =
        padre
            ? `${padre}/${nuevoNombre}`
            : nuevoNombre;


    const archivosNuevos = {};

    for (const archivo of Object.keys(projectFiles)) {

        if (
            archivo === ruta ||
            archivo.startsWith(ruta + "/")
        ) {

            const reemplazo =
                nuevaRuta +
                archivo.slice(ruta.length);

            archivosNuevos[reemplazo] =
                projectFiles[archivo];

            delete projectFiles[archivo];

        }

    }


    Object.assign(
        projectFiles,
        archivosNuevos
    );


    const carpetasNuevas =
        new Set();

    for (const carpeta of projectFolders) {

        if (
            carpeta === ruta ||
            carpeta.startsWith(ruta + "/")
        ) {

            const reemplazo =
                nuevaRuta +
                carpeta.slice(ruta.length);

            carpetasNuevas.add(reemplazo);

        } else {

            carpetasNuevas.add(carpeta);

        }

    }


    projectFolders =
        carpetasNuevas;


    if (
        archivoActual === ruta ||
        archivoActual?.startsWith(ruta + "/")
    ) {

        archivoActual =
            nuevaRuta +
            archivoActual.slice(ruta.length);

    }


    renderizarArbolArchivos();

}


// ============
