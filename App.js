import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://backend-wmt.onrender.com";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ScrollView } from "react-native";

const Stack = createNativeStackNavigator();

/* ===========================================================
   🔐 TELA DE LOGIN
   =========================================================== */
function LoginScreen({ navigation }) {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin() {
  if (!nomeUsuario.trim()) {
    alert("Digite um nome de usuário.");
    return;
  }

  try {
    await AsyncStorage.removeItem("stats");
await AsyncStorage.setItem("usuarioNome", nomeUsuario);

navigation.replace("Home");
  } catch (error) {
    alert("Erro ao fazer login.");
  }
}

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>WMT</Text>
      <Text style={styles.subtitle}>Monte seu time. Jogue. Compartilhe.</Text>

      <TextInput
  style={styles.input}
  placeholder="Nome de usuário"
  placeholderTextColor="#888"
  value={nomeUsuario}
  onChangeText={setNomeUsuario}
/>
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>Entrar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ===========================================================
   🏠 TELA HOME
   =========================================================== */
function HomeScreen({ navigation }) {

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 🔥 TÍTULO */}
      <Text style={styles.screenTitle}>Menu</Text>

      {/* 🔥 AÇÕES PRINCIPAIS */}
      <Text style={styles.sectionTitle}>Jogar</Text>

      <TouchableOpacity
      style={styles.primaryButton}
      onPress={() => navigation.navigate("SelecionarQuadra")}
      >
      <Text style={styles.primaryButtonText}>Criar Jogo</Text>
    </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("ListaJogos")}
      >
        <Text style={styles.primaryButtonText}>Ver Jogos</Text>
      </TouchableOpacity>

      {/* 🔧 OUTRAS FUNÇÕES */}
      <Text style={styles.sectionTitle}>Outros</Text>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("Perfil")}
      >
        <Text style={styles.secondaryButtonText}>Meu Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("Estatisticas")}
      >
        <Text style={styles.secondaryButtonText}>Minhas Estatísticas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("Avaliacao")}
      >
        <Text style={styles.secondaryButtonText}>Avaliar Quadras</Text>
      </TouchableOpacity>

      {/* 🏀 QUADRAS */}

      

    </SafeAreaView>
  );
}

function SelecionarQuadraScreen({ navigation }) {
  const [quadras, setQuadras] = useState([]);
  const [novaQuadra, setNovaQuadra] = useState("");

  useEffect(() => {
  buscarQuadras();
}, []);

 async function buscarQuadras() {
  try {
    const response = await fetch(`${API_URL}/quadras`);

    // 👇 COLOCA AQUI
    if (!response.ok) {
      throw new Error("Erro ao buscar quadras");
    }

    const data = await response.json();

    // 👇 LOG PRA DEBUG
    console.log("Quadras recebidas:", data);

    setQuadras(data);

  } catch (error) {
    console.log(error);
  }
}

async function criarQuadraEIrParaJogo() {
  if (!novaQuadra) {
    alert("Digite o nome da quadra!");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/quadras`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: novaQuadra,
      }),
    });

    const nova = await response.json();

    // 🔥 AGORA SIM
    navigation.navigate("CriarJogo", {
      quadraSelecionada: nova,
    });

  } catch (error) {
    console.log(error);
    alert("Erro ao criar quadra");
  }
}

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView>

        <Text style={styles.screenTitle}>Escolha uma quadra</Text>

        {quadras.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardSubtitle}>{item.bairro}</Text>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={() =>
                navigation.navigate("CriarJogo", { quadraSelecionada: item })
              }
            >
              <Text style={styles.cardButtonText}>Selecionar</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* 🔥 NOVA QUADRA */}
        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Ou criar em nova quadra</Text>

          <TextInput
            style={[styles.input, { marginBottom: 10 }]}
            placeholder="Digite o nome da quadra"
            placeholderTextColor="#888"
            value={novaQuadra}
            onChangeText={setNovaQuadra}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={criarQuadraEIrParaJogo}
            >
            <Text style={styles.primaryButtonText}>
              Criar jogo nesta quadra
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

    </SafeAreaView>
  );
}
/* ===========================================================
   🧍 TELA DE PERFIL
   =========================================================== */
function PerfilScreen({ navigation }) {
  const [historico, setHistorico] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [quadras, setQuadras] = useState([]);

  async function carregarEstatisticas() {
    const dados = await AsyncStorage.getItem("stats");
    const lista = dados ? JSON.parse(dados) : [];
    setHistorico(lista);
  }
  async function carregarUsuario() {
  try {
    const nome = await AsyncStorage.getItem("usuarioNome");

    if (nome) {
      setNomeUsuario(nome);
    }
  } catch (error) {
    console.log(error);
  }
}
async function carregarQuadras() {
  try {
    const response = await fetch(`${API_URL}/quadras`);
    const data = await response.json();
    setQuadras(data);
  } catch (error) {
    console.log(error);
  }
}

  useEffect(() => {
  carregarEstatisticas();
  carregarUsuario();
  carregarQuadras();
}, []);

  const totalJogos = historico.length;
  const insignia =
  totalJogos >= 20
    ? "🔥 Veterano"
    : totalJogos >= 5
    ? "🟢 Jogador Ativo"
    : "🎯 Iniciante";
  const mediaPontos =
  totalJogos > 0
    ? (
        historico.reduce(
          (soma, jogo) => soma + Number(jogo.pts),
          0
        ) / totalJogos
      ).toFixed(1)
    : 0;

    const melhorPartida =
  historico.length > 0
    ? historico.reduce((melhor, atual) => {
        const indiceMelhor =
          Number(melhor.pts) +
          Number(melhor.reb) +
          Number(melhor.ast) +
          Number(melhor.stl || 0) +
          Number(melhor.blk || 0);

        const indiceAtual =
          Number(atual.pts) +
          Number(atual.reb) +
          Number(atual.ast) +
          Number(atual.stl || 0) +
          Number(atual.blk || 0);

        return indiceAtual > indiceMelhor ? atual : melhor;
      })
    : null;
    const quadrasComMedia = quadras
  .filter((q) => q.avaliacoes && q.avaliacoes.length > 0)
  .map((q) => ({
    ...q,
    media:
      q.avaliacoes.reduce((a, b) => a + b, 0) /
      q.avaliacoes.length,
  }));

const quadraFavorita =
  quadrasComMedia.length > 0
    ? quadrasComMedia.reduce((melhor, atual) =>
        atual.media > melhor.media ? atual : melhor
      )
    : null;

    async function encerrarSessao() {
  Alert.alert(
    "Encerrar sessão",
    "Deseja realmente sair do aplicativo?",
    [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("usuarioNome");
            await AsyncStorage.removeItem("stats");
            await AsyncStorage.removeItem("notaSelecionada");

            navigation.replace("Login");
          } catch (error) {
            console.log(error);
            alert("Erro ao encerrar a sessão.");
          }
        },
      },
    ]
  );
}

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.screenTitle}>
        👤 Meu Perfil
      </Text>

      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>🏀</Text>
        </View>

        <Text style={styles.profileName}>
  {nomeUsuario || "Jogador"}
</Text>

<View style={styles.badge}>
  <Text style={styles.badgeText}>
    {insignia}
  </Text>
</View>

<Text style={styles.profileSubtitle}>
  WMT PLAYER CARD
</Text>
      </View>

      <Text
        style={{
          color: "#9CA3AF",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Conectando jogadores através do basquete.
      </Text>

      <View style={styles.dashboardContainer}>

        <View style={styles.dashboardRow}>

          <View style={styles.dashboardCard}>
            <Text style={styles.dashboardTitle}>🏀 Jogos</Text>
            <Text style={styles.dashboardValue}>
  {totalJogos}
</Text>
          </View>

          <View style={styles.dashboardCard}>
            <Text style={styles.dashboardTitle}>⭐ Média</Text>
            <Text style={styles.dashboardValue}>
  {mediaPontos}
</Text>
          </View>

        </View>

        <View style={styles.dashboardRow}>

          <View style={styles.dashboardCard}>
  <Text style={styles.dashboardTitle}>🏆 Melhor</Text>

  <Text style={styles.dashboardValue}>
    {melhorPartida
      ? `${melhorPartida.pts} PTS`
      : "--"}
  </Text>

  {melhorPartida && (
    <Text style={styles.cardSubtitle}>
      🏆 WMT {Number(melhorPartida.pts) +
        Number(melhorPartida.reb) +
        Number(melhorPartida.ast) +
        Number(melhorPartida.stl || 0) +
        Number(melhorPartida.blk || 0)}
    </Text>
  )}
</View>
          <View style={styles.dashboardCard}>
  <Text style={styles.dashboardTitle}>📍 Quadra</Text>

  <Text style={styles.dashboardValue}>
    {quadraFavorita ? quadraFavorita.nome : "--"}
  </Text>
</View>

        </View>

      </View>

      <View style={styles.dashboardCard}>

        <Text style={styles.dashboardTitle}>
          ⭐ Nota média da quadra
        </Text>

        <Text style={styles.dashboardValue}>
          ★★★★★
        </Text>

        <Text style={styles.cardSubtitle}>
  {quadraFavorita
    ? `${quadraFavorita.media.toFixed(1)} ⭐`
    : "--"}
</Text>

      </View>
      <TouchableOpacity
  style={styles.logoutButton}
  onPress={encerrarSessao}
>
  <Text style={styles.logoutButtonText}>
    🚪 Encerrar sessão
  </Text>
</TouchableOpacity>

    </SafeAreaView>
  );
}

/* ===========================================================
   📊 TELA DE ESTATÍSTICAS
   =========================================================== */
function EstatisticasScreen() {
  const [pontos, setPontos] = useState("");
  const [rebotes, setRebotes] = useState("");
  const [assistencias, setAssistencias] = useState("");
  const [roubos, setRoubos] = useState("");
  const [tocos, setTocos] = useState("");

  const [historico, setHistorico] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  async function salvarEstatistica() {
    if (!pontos || !rebotes || !assistencias) {
      alert("Preencha pelo menos pontos, rebotes e assistências.");
      return;
    }

    const novaPartida = {
      id: Date.now().toString(),
      pts: pontos,
      reb: rebotes,
      ast: assistencias,
      stl: roubos,
      blk: tocos,
      data: new Date().toLocaleDateString(),
    };

    try {
      const dados = await AsyncStorage.getItem("stats");
      const lista = dados ? JSON.parse(dados) : [];

      lista.push(novaPartida);

      await AsyncStorage.setItem("stats", JSON.stringify(lista));
      setHistorico(lista);
      setMostrarFormulario(false);

// Limpa os campos
setPontos("");
setRebotes("");
setAssistencias("");
setRoubos("");
setTocos("");



      alert("Estatísticas salvas!");
    } catch (error) {
  console.log("Erro:", error);
  alert("Erro ao salvar estatísticas.");
}
  }
  async function excluirPartida(id) {
  Alert.alert(
    "Excluir partida",
    "Tem certeza que deseja excluir esta partida?",
    [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            const dados = await AsyncStorage.getItem("stats");
            const lista = dados ? JSON.parse(dados) : [];

            const novaLista = lista.filter(
              (item) => item.id !== id
            );

            await AsyncStorage.setItem(
              "stats",
              JSON.stringify(novaLista)
            );

            setHistorico(novaLista);

            alert("Partida excluída!");
          } catch (error) {
            console.log(error);
            alert("Erro ao excluir partida.");
          }
        },
      },
    ]
  );
}

  async function carregarEstatisticas() {
    const dados = await AsyncStorage.getItem("stats");
    const lista = dados ? JSON.parse(dados) : [];
    setHistorico(lista);
  }
 

  useEffect(() => {
    carregarEstatisticas();
  }, []);
  const totalJogos = historico.length;

const mediaPontos =
  totalJogos > 0
    ? (
        historico.reduce((soma, jogo) => soma + Number(jogo.pts), 0) /
        totalJogos
      ).toFixed(1)
    : 0;

const mediaRebotes =
  totalJogos > 0
    ? (
        historico.reduce((soma, jogo) => soma + Number(jogo.reb), 0) /
        totalJogos
      ).toFixed(1)
    : 0;

const mediaAssistencias =
  totalJogos > 0
    ? (
        historico.reduce((soma, jogo) => soma + Number(jogo.ast), 0) /
        totalJogos
      ).toFixed(1)
    : 0;
   const melhorPartida =
  historico.length > 0
    ? historico.reduce((melhor, atual) => {
        const indiceMelhor =
          Number(melhor.pts) +
          Number(melhor.reb) +
          Number(melhor.ast) +
          Number(melhor.stl || 0) +
          Number(melhor.blk || 0);

        const indiceAtual =
          Number(atual.pts) +
          Number(atual.reb) +
          Number(atual.ast) +
          Number(atual.stl || 0) +
          Number(atual.blk || 0);

        return indiceAtual > indiceMelhor ? atual : melhor;
      })
    : null;

  return (
  <SafeAreaView style={styles.container}>
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 40 }}
  >

  <Text style={styles.screenTitle}></Text>
      <Text style={styles.screenTitle}>Minhas Estatísticas</Text>
      <View style={styles.dashboardContainer}>

  <View style={styles.dashboardRow}>

    <View style={styles.dashboardCard}>
      <Text style={styles.dashboardTitle}>🏀 Jogos</Text>
      <Text style={styles.dashboardValue}>{totalJogos}</Text>
    </View>

    <View style={styles.dashboardCard}>
      <Text style={styles.dashboardTitle}>⭐ Média PTS</Text>
      <Text style={styles.dashboardValue}>{mediaPontos}</Text>
    </View>

  </View>

  <View style={styles.dashboardRow}>

    <View style={styles.dashboardCard}>
      <Text style={styles.dashboardTitle}>💪 Rebotes</Text>
      <Text style={styles.dashboardValue}>{mediaRebotes}</Text>
    </View>

    <View style={styles.dashboardCard}>
      <Text style={styles.dashboardTitle}>🤝 Assist.</Text>
      <Text style={styles.dashboardValue}>{mediaAssistencias}</Text>
    </View>

  </View>

</View>
{melhorPartida && (
  <View style={styles.dashboardCard}>
    <Text style={styles.dashboardTitle}>
      🔥 Melhor partida
    </Text>

    <Text style={styles.dashboardValue}>
      {melhorPartida.pts} pontos
    </Text>

    <Text style={styles.cardSubtitle}>
      🏀 {melhorPartida.pts} PTS • 💪 {melhorPartida.reb} REB • 🤝 {melhorPartida.ast} AST
    </Text>

    <Text style={styles.cardSubtitle}>
      🛡️ {melhorPartida.stl} STL • 🚫 {melhorPartida.blk} BLK
    </Text>
    <Text style={styles.cardSubtitle}>
  🏆 Índice:{" "}
  {Number(melhorPartida.pts) +
    Number(melhorPartida.reb) +
    Number(melhorPartida.ast) +
    Number(melhorPartida.stl || 0) +
    Number(melhorPartida.blk || 0)}
</Text>

    <Text style={styles.cardSubtitle}>
      📅 {melhorPartida.data}
    </Text>
  </View>
)}
      <TouchableOpacity
  style={styles.primaryButton}
  onPress={() => setMostrarFormulario(!mostrarFormulario)}
>
  <Text style={styles.primaryButtonText}>
    {mostrarFormulario
      ? "Fechar formulário"
      : "➕ Registrar nova partida"}
      
  </Text>
  
</TouchableOpacity>

{mostrarFormulario && (
<>

      <TextInput
        style={styles.input}
        placeholder="Pontos"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={pontos}
        onChangeText={setPontos}
      />
      <TextInput
        style={styles.input}
        placeholder="Rebotes"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={rebotes}
        onChangeText={setRebotes}
      />
      <TextInput
        style={styles.input}
        placeholder="Assistências"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={assistencias}
        onChangeText={setAssistencias}
      />
      <TextInput
        style={styles.input}
        placeholder="Roubos"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={roubos}
        onChangeText={setRoubos}
      />
      <TextInput
        style={styles.input}
        placeholder="Tocos"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={tocos}
        onChangeText={setTocos}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={salvarEstatistica}>
        <Text style={styles.primaryButtonText}>Salvar estatísticas</Text>
      </TouchableOpacity>
      </>
)}


            <Text style={[styles.screenTitle, { marginTop: 20 }]}>
        📜 Histórico de Partidas
      </Text>

      {historico.length === 0 ? (
        <Text
          style={{
            color: "#888",
            textAlign: "center",
            marginTop: 10,
          }}
        >
          Nenhuma partida registrada.
        </Text>
      ) : (
        historico.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              🏀 {item.data}
            </Text>

            <Text style={styles.cardSubtitle}>
              🏀 {item.pts} PTS • 💪 {item.reb} REB • 🤝 {item.ast} AST
            </Text>

            <Text style={styles.cardSubtitle}>
              🛡️ {item.stl} STL • 🚫 {item.blk} BLK
            </Text>
            <TouchableOpacity
  style={styles.deleteButton}
  onPress={() => excluirPartida(item.id)}
>
  <Text style={styles.deleteButtonText}>
    🗑️ Excluir
  </Text>
</TouchableOpacity>
          </View>
        ))
      )}

    </ScrollView>
  </SafeAreaView>
);
}

/* ===========================================================
   ⭐ TELA DE AVALIAÇÃO DAS QUADRAS
   =========================================================== */
function AvaliacaoScreen() {
const [quadras, setQuadras] = useState([]);
const [notaSelecionada, setNotaSelecionada] = useState({});
useEffect(() => {
  buscarQuadras();
}, []);

async function buscarQuadras() {
  try {
    const response = await fetch(`${API_URL}/quadras`);
    const data = await response.json();
    setQuadras(data);
  } catch (error) {
    console.log(error);
  }
}

async function avaliarQuadra(id, nota) {
  try {
    await fetch(`${API_URL}/quadras/${id}/avaliar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nota }),
    });
    setNotaSelecionada({
  ...notaSelecionada,
  [id]: nota,
});

    alert("⭐ Obrigado pela sua avaliação!");
    buscarQuadras();

  } catch (error) {
    console.log(error);
  }
}

const quadrasOrdenadas = [...quadras].sort((a, b) => {
  const mediaA =
    a.avaliacoes.length > 0
      ? a.avaliacoes.reduce((x, y) => x + y, 0) / a.avaliacoes.length
      : 0;

  const mediaB =
    b.avaliacoes.length > 0
      ? b.avaliacoes.reduce((x, y) => x + y, 0) / b.avaliacoes.length
      : 0;

  return mediaB - mediaA;
});

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>Avaliar Quadras</Text>

      <FlatList
        data={quadrasOrdenadas}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
  const avaliacoes = item.avaliacoes || [];

  const media =
    avaliacoes.length > 0
      ? (
          avaliacoes.reduce((a, b) => a + b, 0) /
          avaliacoes.length
        ).toFixed(1)
      : "Sem avaliações";

      function renderizarEstrelas(media) {
  if (media === "Sem avaliações") {
    return "☆☆☆☆☆";
  }

  const nota = Math.round(Number(media));

  let estrelas = "";

  for (let i = 1; i <= 5; i++) {
    estrelas += i <= nota ? "★" : "☆";
  }

  return estrelas;
}

  return (
    <View style={styles.card}>
      <Text style={styles.rankingText}>
      {index === 0
        ? "🥇 1º Lugar"
        : index === 1
        ? "🥈 2º Lugar"
        : index === 2
        ? "🥉 3º Lugar"
        : `${index + 1}º Lugar`}
    </Text>

      <Text style={styles.cardTitle}>{item.nome}</Text>

      <Text style={styles.cardSubtitle}>
  {renderizarEstrelas(media)} {media}
</Text>

<Text style={styles.cardSubtitle}>
  {avaliacoes.length} {avaliacoes.length === 1 ? "avaliação" : "avaliações"}
</Text>

      <Text style={styles.cardSubtitle}>
  Sua avaliação
</Text>

<View style={{ flexDirection: "row", marginTop: 8 }}>
  {[1, 2, 3, 4, 5].map((nota) => (
    <TouchableOpacity
      key={nota}
      onPress={() => avaliarQuadra(item.id, nota)}
    >
      <Text
        style={{
          fontSize: 30,
          marginRight: 6,
          color:
            nota <= (notaSelecionada[item.id] || 0)
              ? "#FFA500"
              : "#666",
        }}
      >
        ★
      </Text>
    </TouchableOpacity>
  ))}
</View>
    </View>
      );
    }}
      />
    </SafeAreaView>
  );
}

/* ===========================================================
   🌌 NAVEGAÇÃO PRINCIPAL
   =========================================================== */
function CriarJogoScreen({ route, navigation }) {
  const quadra = route.params?.quadraSelecionada;
  const [dataHora, setDataHora] = useState("");
  const [vagas, setVagas] = useState("");

  async function handleCriarJogo() {
    console.log("CLICOU");
    if (!dataHora || !vagas) {
      alert("Preencha todos os campos!");
      return;
    }

    const novoJogo = {
      quadra: quadra?.nome || "Quadra não especificada",
      dataHora,
     vagas: Number(vagas),
    };

    try {
      await fetch(`${API_URL}/jogos`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(novoJogo),
});

      alert("Jogo criado com sucesso!");
      navigation.navigate("ListaJogos");
    } catch (err) {
      alert("Erro ao salvar jogo!");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>Criar jogo</Text>

      {quadra && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Quadra selecionada:</Text>
          <Text style={styles.infoHighlight}>{quadra.nome}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Data e hora (25/11 - 19:30)"
        placeholderTextColor="#888"
        value={dataHora}
        onChangeText={setDataHora}
      />

      <TextInput
        style={styles.input}
        placeholder="Número de vagas"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={vagas}
        onChangeText={setVagas}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleCriarJogo}>
        <Text style={styles.primaryButtonText}>Confirmar jogo</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ===========================================================
   📋 LISTA DE JOGOS
   =========================================================== */
function ListaJogosScreen() {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(false);

  async function carregarJogos() {
   const response = await fetch(`${API_URL}/jogos`);
const data = await response.json();
setJogos(data);
  }

useFocusEffect(
  useCallback(() => {
    carregarJogos();
  }, [])
);
async function entrarNoJogo(id) {
  if (loading) return;

  setLoading(true);

  try {
    await fetch(`${API_URL}/jogos/${id}`, {
      method: "PUT",
    });

    alert("Você entrou no jogo!");
    carregarJogos();

  } catch (error) {
    alert("Erro ao entrar no jogo");
  }

  setLoading(false);
}

 async function limparJogos() {
  try {
    await fetch(`${API_URL}/jogos`, {
      method: "DELETE",
    });

    setJogos([]);
    alert("Todos os jogos foram apagados!");
  } catch (error) {
    alert("Erro ao apagar jogos");
  }
}

async function deletarJogo(id) {
  try {
    await fetch(`${API_URL}/jogos/${id}`, {
      method: "DELETE",
    });

    alert("Jogo deletado!");

    // Atualiza a lista
    carregarJogos();

  } catch (error) {
    alert("Erro ao deletar jogo");
  }
}
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>Jogos disponíveis</Text>

      <TouchableOpacity
        style={[styles.cardButton, { marginBottom: 10 }]}
        onPress={limparJogos}
      >
        <Text style={styles.cardButtonText}>Apagar todos</Text>
      </TouchableOpacity>

      <FlatList
        data={jogos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
             style={[styles.cardButton, { backgroundColor: "red", marginTop: 5 }]}
            onPress={() => deletarJogo(item.id)}
            >
            <Text style={styles.cardButtonText}>Excluir</Text>
            </TouchableOpacity>
            <Text style={styles.cardTitle}>{item.quadra}</Text>
            <Text style={styles.cardSubtitle}>{item.dataHora}</Text>
            <Text style={styles.cardSubtitle}>
              {item.vagas > 0 ? `Vagas: ${item.vagas}` : "LOTADO"}
            </Text>

            <TouchableOpacity
              style={[
                      styles.cardButton,
                     { backgroundColor: item.vagas === 0 || loading ? "gray" : "#FF7B00" }
                   ]}
                     disabled={item.vagas === 0 || loading}
                  onPress={() => entrarNoJogo(item.id)}
                >   
              <Text style={styles.cardButtonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

/* ===========================================================
   EXPORT PRINCIPAL
   =========================================================== */
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#121212" },
          headerTintColor: "#fff",
          contentStyle: { backgroundColor: "#121212" },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CriarJogo" component={CriarJogoScreen} />
        <Stack.Screen name="ListaJogos" component={ListaJogosScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="Estatisticas" component={EstatisticasScreen} />
        <Stack.Screen name="Avaliacao"component={AvaliacaoScreen}options={{ title: "Avaliação das Quadras" }}/>
        <Stack.Screen name="SelecionarQuadra" component={SelecionarQuadraScreen} options={{ title: "Selecionar Quadra" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/* ===========================================================
   🎨 ESTILOS — TEMA ESCURO
   =========================================================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  logo: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: "#fff",
  },
  primaryButton: {
    backgroundColor: "#FF7B00",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  secondaryButton: {
    padding: 12,
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: "#FF7B00",
    fontWeight: "bold",
  },
  screenTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtitle: {
  color: "#BDBDBD",
  fontSize: 15,
  marginTop: 3,
},
  cardButton: {
    marginTop: 10,
    backgroundColor: "#FF7B00",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cardButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  infoBox: {
    backgroundColor: "#1E1E1E",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    color: "#aaa",
  },
  infoHighlight: {
    color: "#fff",
    fontWeight: "bold",
  },
  sectionTitle: {
  color: "#aaa",
  fontSize: 16,
  marginTop: 15,
  marginBottom: 8,
},

smallButton: {
  backgroundColor: "#FF7B00",
  padding: 8,
  marginRight: 5,
  borderRadius: 6,
},

smallButtonText: {
  color: "#fff",
  fontWeight: "bold",
},

bestQuadra: {
  color: "#D4AF37",
  fontWeight: "bold",
  fontSize: 16,
  marginBottom: 8,
},

rankingText: {
  color: "#D4AF37",
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 6,
},
dashboardTitle: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "600",
},

dashboardValue: {
  color: "#FFFFFF",
  fontSize: 26,
  fontWeight: "bold",
},

deleteButton: {
  marginTop: 10,
  backgroundColor: "#c0392b",
  padding: 10,
  borderRadius: 8,
  alignItems: "center",
},

deleteButtonText: {
  color: "#fff",
  fontWeight: "bold",
},

profileHeader: {
  alignItems: "center",
  marginBottom: 25,
},

profileAvatar: {
  width: 110,
  height: 110,
  borderRadius: 55,
  backgroundColor: "#1f2937",
  borderWidth: 3,
  borderColor: "#f59e0b",
  justifyContent: "center",
  alignItems: "center",
},

profileAvatarText: {
  fontSize: 48,
},

profileName: {
  color: "#fff",
  fontSize: 24,
  fontWeight: "bold",
  marginTop: 15,
},

profileSubtitle: {
  color: "#9ca3af",
  marginTop: 5,
  fontSize: 14,
  textAlign: "center",
},
profileHeader: {
  alignItems: "center",
  marginBottom: 15,
},

profileAvatar: {
  width: 110,
  height: 110,
  borderRadius: 55,
  backgroundColor: "#1F2937",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 3,
  borderColor: "#F59E0B",
},

profileAvatarText: {
  fontSize: 50,
},

profileName: {
  color: "#FFFFFF",
  fontSize: 24,
  fontWeight: "bold",
  marginTop: 15,
},

profileSubtitle: {
  color: "#F59E0B",
  fontWeight: "bold",
  marginTop: 5,
  fontSize: 15,
},
badge: {
  backgroundColor: "#16a34a",
  paddingHorizontal: 16,
  paddingVertical: 6,
  borderRadius: 20,
  marginTop: 10,
  alignSelf: "center",
},

badgeText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 13,
},

logoutButton: {
  backgroundColor: "#dc2626",
  padding: 14,
  borderRadius: 10,
  marginTop: 25,
  marginBottom: 20,
  alignItems: "center",
},

logoutButtonText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
},

});
