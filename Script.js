let boton = document.getElementById("generar");

boton.addEventListener("click", async function() {

    let caja = document.getElementById("peticion");
    let resultado = document.getElementById("resultado");

    let texto = caja.value;

    resultado.textContent = "Dorrón está pensando... 🤖";

    console.log("Petición del usuario:", texto);

});
