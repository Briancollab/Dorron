import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: "online",
        message: "Dorrón backend está funcionando 🤖"
    });
});

app.listen(PORT, () => {
    console.log(`Dorrón funcionando en el puerto ${PORT}`);
});
