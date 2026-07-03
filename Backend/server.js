const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let jogos = [];
let quadras = [
  { id: "1", nome: "Quadra Municipal", bairro: "Centro", avaliacoes: [] },
  { id: "2", nome: "Quadra Mãe de Deus", bairro: "Zona Sul", avaliacoes: [] },
  { id: "3", nome: "Quadra da Praça Azul", bairro: "Zona Norte", avaliacoes: [] },
];

// LISTAR JOGOS
app.get("/jogos", (req, res) => {
  res.json(jogos);
});

// LISTAR QUADRA
app.get("/quadras", (req, res) => {
  const quadrasSeguras = quadras.map(q => ({
    ...q,
    avaliacoes: Array.isArray(q.avaliacoes) ? q.avaliacoes : []
  }));

  res.json(quadrasSeguras);
});

app.post("/quadras", (req, res) => {
  const novaQuadra = {
  id: Date.now().toString(),
  nome: req.body.nome,
  bairro: req.body.bairro || "Não informado",
  avaliacoes: [], // 🔥 ESSENCIAL
};

  quadras.push(novaQuadra);
  res.json(novaQuadra);
});

app.post("/quadras/:id/avaliar", (req, res) => {
  const { id } = req.params;
  const { nota } = req.body;

  const quadra = quadras.find(q => q.id === id);

  if (!quadra) {
    return res.status(404).json({ error: "Quadra não encontrada" });
  }

  quadra.avaliacoes.push(nota);

  res.json(quadra);
});

// CRIAR JOGO
app.post("/jogos", (req, res) => {

  console.log("Tipo de vagas:", typeof req.body.vagas);
  console.log("Valor de vagas:", req.body.vagas);

  const jogo = {
    id: Date.now().toString(),
    quadra: req.body.quadra,
    dataHora: req.body.dataHora,
    vagas: Number(req.body.vagas),
  };

  console.log("Depois da conversão:", typeof jogo.vagas);

  jogos.push(jogo);
  res.json(jogo);
});

// DELETAR TODOS OS JOGOS
app.delete("/jogos", (req, res) => {
  jogos = [];
  res.json({ message: "Todos os jogos foram apagados" });
});

// DELETAR UM JOGO ESPECÍFICO
app.delete("/jogos/:id", (req, res) => {
  const { id } = req.params;

  jogos = jogos.filter((jogo) => jogo.id !== id);

  res.json({ message: "Jogo deletado com sucesso" });
});

// ENTRAR NO JOGO (diminuir vagas)
app.put("/jogos/:id", (req, res) => {
  const { id } = req.params;

  const jogo = jogos.find((j) => j.id === id);

  if (!jogo) {
    return res.status(404).json({ message: "Jogo não encontrado" });
  }

  jogo.vagas = Number(jogo.vagas);

 if (jogo.vagas > 0) {
  jogo.vagas = jogo.vagas - 1;
} else {
  jogo.vagas = 0;
}

  res.json(jogo);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});