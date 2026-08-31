let boton = document.getElementById("generar");
let caja = document.getElementById("peticion");
let resultado = document.getElementById("resultado");

boton.addEventListener("click", function() {

    let texto = caja.value;

    resultado.innerHTML = `
        <h1>${texto}</h1>
        <p>🚨 PRUEBA DORRÓN 123 🚨</p>
        <button>Entrar</button>
    `;

});
