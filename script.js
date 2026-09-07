// ============================================================
// DORRÓN IA — SCRIPT PRINCIPAL
// ============================================================

const API_URL =
    "https://dorron-api-backend--brianstiven608.replit.app";

const STORAGE_KEY =
    "dorron_projects_v2";


// ============================================================
// ELEMENTOS DOM
// ============================================================

const app =
    document.querySelector(".app");

const newProjectButton =
    document.getElementById("newProject");

const projectList =
    document.getElementById("projectList");

const projectName =
    document.getElementById("projectName");

const saveProjectButton =
    document.getElementById("saveProject");

const shareProjectButton =
    document.getElementById("shareProject");

const publishProjectButton =
    document.getElementById("publishProject");

const aiTool =
    document.getElementById("aiTool");

const previewTool =
    document.getElementById("previewTool");

const codeTool =
    document.getElementById("codeTool");

const codeView =
    document.getElementById("codeView");

const closeCode =
    document.getElementById("closeCode");

const importProjectButton =
    document.getElementById("importProject");

const projectZipInput =
    document.getElementById("projectZipInput");

const projectFolderInput =
    document.getElementById("projectFolderInput");

const newFolderButton =
    document.getElementById("newFolder");

const newFileButton =
    document.getElementById("newFile");

const fileTree =
    document.getElementById("fileTree");

const codeEditor =
    document.getElementById("codeEditor");

const editorLanguage =
    document.getElementById("editorLanguage");

const editorPath =
    document.getElementById("editorPath");

const activeFileTab =
    document.getElementById("activeFileTab");

const saveFileButton =
    document.getElementById("saveFile");

const conversation =
    document.getElementById("conversation");

const peticion =
    document.getElementById("peticion");

const generar =
    document.getElementById("generar");

const loading =
    document.getElementById("loading");

const estado =
    document.getElementById("estado");

const emptyPreview =
    document.getElementById("empty-preview");

const resultado =
    document.getElementById("resultado");

const webPreview =
    document.getElementById("webPreview");

const refreshPreview =
    document.getElementById("refreshPreview");


// ============================================================
// ESTADO
// ============================================================

let projects = [];

let currentProjectId = null;

let projectFiles = {};

let projectFolders = new Set();

let archivoActual = null;

let carpetaActual = "";

let carpetasAbiertas = new Set();

let proyectoCreado = false;


// ============================================================
// UTILIDADES
// ============================================================

function generarId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );
}


function limpiarRuta(ruta) {

    return String(ruta || "")
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")
        .replace(/^\.\//, "")
        .replace(/\.\.\//g, "")
        .replace(/\/+/g, "/")
        .replace(/^\/|\/$/g, "")
        .trim();
}


function nombreProyectoUnico(nombre) {

    const base =
        String(nombre || "Mi proyecto")
            .trim() ||
        "Mi proyecto";

    let resultado = base;
    let numero = 2;

    while (
        projects.some(
            proyecto =>
                String(proyecto.name)
                    .toLowerCase() ===
                resultado.toLowerCase()
        )
    ) {

        resultado =
            `${base} ${numero}`;

        numero++;
    }

    return resultado;
}


function obtenerProyectoActual() {

    return projects.find(
        proyecto =>
            proyecto.id ===
            currentProjectId
    );
}


function agregarMensajeIA(texto) {

    if (!conversation) return;

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "ai-message";

    wrapper.style.cssText = `
        display:flex;
        gap:10px;
        margin-top:16px;
    `;

    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        "D";

    const contenido =
        document.createElement("div");

    contenido.className =
        "message-content";

    const textoElemento =
        document.createElement("p");

    textoElemento.textContent =
        texto;

    contenido.appendChild(
        textoElemento
    );

    wrapper.appendChild(
        avatar
    );

    wrapper.appendChild(
        contenido
    );

    conversation.appendChild(
        wrapper
    );

    conversation.scrollTop =
        conversation.scrollHeight;
}


// ============================================================
// PERSISTENCIA
// ============================================================

function cargarProyectos() {

    try {

        const guardado =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!guardado) {

            crearProyectoInicial();

            return;
        }

        const datos =
            JSON.parse(guardado);

        if (
            !Array.isArray(datos) ||
            datos.length === 0
        ) {

            crearProyectoInicial();

            return;
        }

        projects =
            datos.map(
                proyecto => ({

                    id:
                        proyecto.id ||
                        generarId(),

                    name:
                        proyecto.name ||
                        "Mi proyecto",

                    files:
                        proyecto.files &&
                        typeof proyecto.files === "object"
                            ? proyecto.files
                            : {},

                    folders:
                        Array.isArray(
                            proyecto.folders
                        )
                            ? proyecto.folders
                            : [],

                    updatedAt:
                        proyecto.updatedAt ||
                        Date.now()

                })
            );

        const ultimo =
            localStorage.getItem(
                "dorron_current_project"
            );

        const existeUltimo =
            projects.some(
                proyecto =>
                    proyecto.id ===
                    ultimo
            );

        currentProjectId =
            existeUltimo
                ? ultimo
                : projects[0].id;

        cargarProyectoActual();

    } catch (error) {

        console.error(
            "Error cargando proyectos:",
            error
        );

        crearProyectoInicial();
    }
}


function guardarProyectos() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(projects)
        );

        localStorage.setItem(
            "dorron_current_project",
            currentProjectId || ""
        );

        return true;

    } catch (error) {

        console.error(
            "Error guardando proyectos:",
            error
        );

        alert(
            "No se pudieron guardar los proyectos. El almacenamiento del navegador puede estar lleno."
        );

        return false;
    }
}


// ============================================================
// PROYECTO INICIAL
// ============================================================

function crearProyectoInicial() {

    const proyecto = {

        id:
            generarId(),

        name:
            "Mi proyecto",

        files: {},

        folders: [],

        updatedAt:
            Date.now()

    };

    projects = [
        proyecto
    ];

    currentProjectId =
        proyecto.id;

    guardarProyectos();

    cargarProyectoActual();
}


// ============================================================
// CARGAR PROYECTO
// ============================================================

function cargarProyectoActual() {

    const proyecto =
        obtenerProyectoActual();

    if (!proyecto) return;

    guardarArchivoActual();

    projectFiles = {
        ...proyecto.files
    };

    projectFolders =
        new Set(
            proyecto.folders || []
        );

    archivoActual =
        null;

    carpetaActual =
        "";

    carpetasAbiertas =
        new Set();

    proyectoCreado =
        Object.keys(
            projectFiles
        ).length > 0 ||
        projectFolders.size > 0;

    actualizarNombreProyecto();

    renderizarListaProyectos();

    renderizarArbolArchivos();

    limpiarEditor();

    cargarPreviewProyecto();
}


function actualizarNombreProyecto() {

    const proyecto =
        obtenerProyectoActual();

    if (
        !proyecto ||
        !projectName
    ) {
        return;
    }

    projectName.innerHTML =
        "";

    const punto =
        document.createElement(
            "span"
        );

    punto.className =
        "live-dot";

    const nombre =
        document.createElement(
            "span"
        );

    nombre.textContent =
        proyecto.name;

    projectName.appendChild(
        punto
    );

    projectName.appendChild(
        nombre
    );
}


// ============================================================
// CAMBIAR PROYECTO
// ============================================================

function cambiarProyecto(id) {

    if (!id) return;

    guardarArchivoActual();

    guardarEstadoProyectoActual();

    const existe =
        projects.some(
            proyecto =>
                proyecto.id === id
        );

    if (!existe) return;

    currentProjectId =
        id;

    localStorage.setItem(
        "dorron_current_project",
        id
    );

    cargarProyectoActual();

    agregarMensajeIA(
        `📂 Proyecto abierto: ${obtenerProyectoActual().name}`
    );
}


// ============================================================
// GUARDAR ESTADO
// ============================================================

function guardarEstadoProyectoActual() {

    const proyecto =
        obtenerProyectoActual();

    if (!proyecto) return;

    proyecto.files = {
        ...projectFiles
    };

    proyecto.folders =
        [...projectFolders];

    proyecto.updatedAt =
        Date.now();
}


function guardarProyectoCompleto(
    mostrarMensaje = false
) {

    guardarArchivoActual();

    guardarEstadoProyectoActual();

    const guardado =
        guardarProyectos();

    if (
        guardado &&
        mostrarMensaje
    ) {

        agregarMensajeIA(
            `💾 Proyecto guardado: ${
                obtenerProyectoActual()?.name ||
                "Proyecto"
            }`
        );
    }

    return guardado;
}


// ============================================================
// LISTA DE PROYECTOS
// ============================================================

function renderizarListaProyectos() {

    if (!projectList) return;

    projectList.innerHTML =
        "";

    for (
        const proyecto of projects
    ) {

        const elemento =
            document.createElement(
                "div"
            );

        elemento.className =
            "project-item";

        if (
            proyecto.id ===
            currentProjectId
        ) {

            elemento.classList.add(
                "active"
            );
        }

        elemento.dataset.projectId =
            proyecto.id;

        const punto =
            document.createElement(
                "span"
            );

        punto.className =
            "project-dot";

        const nombre =
            document.createElement(
                "span"
            );

        nombre.className =
            "project-name-label";

        nombre.textContent =
            proyecto.name;

        elemento.appendChild(
            punto
        );

        elemento.appendChild(
            nombre
        );

        elemento.addEventListener(
            "click",
            () =>
                cambiarProyecto(
                    proyecto.id
                )
        );

        projectList.appendChild(
            elemento
        );
    }
}


// ============================================================
// NUEVO PROYECTO
// ============================================================

function crearNuevoProyecto() {

    guardarProyectoCompleto();

    let nombre =
        prompt(
            "Nombre del nuevo proyecto:",
            ""
        );

    if (nombre === null) {
        return;
    }

    nombre =
        nombre.trim();

    if (!nombre) {

        nombre =
            `Proyecto ${projects.length + 1}`;
    }

    nombre =
        nombreProyectoUnico(
            nombre
        );

    const proyecto = {

        id:
            generarId(),

        name:
            nombre,

        files: {},

        folders: [],

        updatedAt:
            Date.now()

    };

    projects.push(
        proyecto
    );

    currentProjectId =
        proyecto.id;

    guardarProyectos();

    cargarProyectoActual();

    agregarMensajeIA(
        `✨ Nuevo proyecto creado: ${nombre}`
    );
}


if (newProjectButton) {

    newProjectButton.addEventListener(
        "click",
        crearNuevoProyecto
    );
}


// ============================================================
// IMPORTAR PROYECTO
// ============================================================

if (importProjectButton) {

    importProjectButton.addEventListener(
        "click",
        () => {

            if (projectZipInput) {

                projectZipInput.value =
                    "";

                projectZipInput.click();

                return;
            }

            if (projectFolderInput) {

                projectFolderInput.value =
                    "";

                projectFolderInput.click();
            }
        }
    );
}


// ============================================================
// IMPORTAR ZIP
// ============================================================

if (projectZipInput) {

    projectZipInput.addEventListener(
        "change",
        async event => {

            const archivo =
                event.target.files?.[0];

            if (!archivo) return;

            await importarZIP(
                archivo
            );

            event.target.value =
                "";
        }
    );
}


async function importarZIP(archivo) {

    if (!archivo) {
        return;
    }

    if (
        typeof JSZip ===
        "undefined"
    ) {

        alert(
            "No se pudo cargar el sistema de importación ZIP."
        );

        return;
    }

    try {

        agregarMensajeIA(
            `📥 Importando proyecto: ${archivo.name}`
        );

        const zip =
            await JSZip.loadAsync(
                archivo
            );

        const files = {};

        const folders =
            new Set();

        const entradas =
            Object.values(
                zip.files
            );

        if (!entradas.length) {

            alert(
                "El ZIP está vacío."
            );

            return;
        }

        for (
            const entrada of entradas
        ) {

            let ruta =
                limpiarRuta(
                    entrada.name
                );

            if (!ruta) {
                continue;
            }

            if (
                ruta === ".." ||
                ruta.startsWith("../") ||
                ruta.includes("/../")
            ) {

                console.warn(
                    "Ruta ZIP ignorada:",
                    entrada.name
                );

                continue;
            }

            if (entrada.dir) {

                folders.add(
                    ruta
                );

                continue;
            }

            /*
             * Archivos de texto:
             * HTML, CSS, JS, JSX, TS, TSX,
             * JSON, Markdown, SVG, XML, etc.
             */

            const extension =
                ruta
                    .split(".")
                    .pop()
                    .toLowerCase();

            const extensionesTexto = [
                "html",
                "htm",
                "css",
                "js",
                "mjs",
                "cjs",
                "jsx",
                "ts",
                "tsx",
                "json",
                "md",
                "markdown",
                "svg",
                "xml",
                "xhtml",
                "txt",
                "map",
                "webmanifest",
                "yml",
                "yaml",
                "scss",
                "sass",
                "less"
            ];

            if (
                extensionesTexto.includes(
                    extension
                )
            ) {

                files[ruta] =
                    await entrada.async(
                        "string"
                    );

            } else {

                /*
                 * Los archivos binarios se guardan
                 * como Data URL para evitar convertirlos
                 * incorrectamente a texto.
                 */

                files[ruta] =
                    await entrada.async(
                        "base64"
                    );

            }

            asegurarCarpetasPadreEnSet(
                ruta,
                folders
            );
        }

        const cantidad =
            Object.keys(
                files
            ).length;

        if (cantidad === 0) {

            alert(
                "No se encontraron archivos válidos dentro del ZIP."
            );

            agregarMensajeIA(
                "⚠️ El ZIP no contiene archivos importables."
            );

            return;
        }

        let nombreBase =
            archivo.name
                .replace(
                    /\.zip$/i,
                    ""
                )
                .trim();

        if (!nombreBase) {

            nombreBase =
                "Proyecto importado";
        }

        const nombre =
            nombreProyectoUnico(
                nombreBase
            );

        const proyecto = {

            id:
                generarId(),

            name:
                nombre,

            files:
                files,

            folders:
                [...folders],

            updatedAt:
                Date.now()

        };

        /*
         * MUY IMPORTANTE:
         * No reemplazamos el proyecto anterior.
         * Lo añadimos como proyecto nuevo.
         */

        projects.push(
            proyecto
        );

        currentProjectId =
            proyecto.id;

        const guardado =
            guardarProyectos();

        if (!guardado) {

            projects =
                projects.filter(
                    item =>
                        item.id !==
                        proyecto.id
                );

            return;
        }

        cargarProyectoActual();

        abrirVistaCodigo();

        agregarMensajeIA(
            `✅ Proyecto "${nombre}" importado correctamente.`
        );

        agregarMensajeIA(
            `📁 ${cantidad} archivos y ${folders.size} carpetas detectados.`
        );

    } catch (error) {

        console.error(
            "Error importando ZIP:",
            error
        );

        alert(
            "No se pudo importar el proyecto ZIP."
        );

        agregarMensajeIA(
            "❌ No se pudo importar el proyecto."
        );
    }
}


// ============================================================
// IMPORTAR CA
