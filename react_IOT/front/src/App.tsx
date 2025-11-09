import { useEffect, useState } from "react";
import "./App.css";
 
// Definindo o Enum para as posições
enum Posicao {
  Posição1 = 1,  // Posição 1
  Posição2 = 2,  // Posição 2
  Posição3 = 3,  // Posição 3
  Posição4 = 4,  // Posição 4
}
 
interface Moto {
  id: number;
  nome: string;
  status: string;
  contador: number;
  posicao: Posicao; // Agora posicao é do tipo enum
}
 
function App() {
  const [motos, setMotos] = useState<Moto[]>([]);
 
  // Mapeamento de cores para as posições usando o enum
  const posicaoCor: { [key in Posicao]: string } = {
    [Posicao.Posição1]: 'red',      // Posição 1 será vermelha
    [Posicao.Posição2]: 'grey',     // Posição 2 será cinza
    [Posicao.Posição3]: 'yellow',    // Posição 3 será amarela
    [Posicao.Posição4]: 'orange',   // Posição 4 será laranja
  };
 
  useEffect(() => {
    console.log("🔄 Iniciando fetch de motos...");
 
    fetch("http://localhost:5000/api/motos")
      .then((res) => {
        console.log("📡 Resposta recebida:", res);
        if (!res.ok) throw new Error("Erro HTTP " + res.status);
        return res.json();
      })
      .then((data: Moto[]) => {
        console.log("✅ Dados recebidos:", data);
        setMotos(data);
      })
      .catch((err) => console.error("❌ Erro ao buscar motos:", err));
 
    console.log("🔌 Conectando ao SSE...");
    const eventSource = new EventSource("http://localhost:5000/stream");
 
    eventSource.onopen = () => {
      console.log("✅ Conexão SSE aberta");
    };
 
    eventSource.onmessage = (event) => {
      console.log("📥 Mensagem SSE:", event.data);
      const data = JSON.parse(event.data);
      setMotos((prevMotos) =>
        prevMotos.map((m) =>
          m.id === data.id ? { ...m, status: data.status } : m
        )
      );
    };
 
    eventSource.onerror = (err) => {
      console.error("❌ Erro no stream:", err);
      eventSource.close();
    };
 
    return () => {
      console.log("🔒 Fechando SSE");
      eventSource.close();
    };
  }, []);
 
  // 🚨 Função para ativar alerta
  const handleAtivarAlerta = async (id: number, nome: string) => {
    try {
      console.log(`🚨 Enviando alerta para moto ${id}...`);
      const res = await fetch(`http://localhost:5000/ativar_alerta/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
 
      const data = await res.json();
      console.log("✅ Resposta do servidor:", data);
 
      alert(`⚠️ Alerta ativado para a moto: ${nome}`);
    } catch (err) {
      console.error("❌ Erro ao ativar alerta:", err);
    }
  };
 
  return (
    <div className="container">
      {/* Adicionando a imagem no canto superior direito */}
      <img
        src="/src/assets/image 4.png"  // Caminho para a imagem na pasta 'public/assets'
        alt="Mapa"
        style={{
          position: 'fixed',
          top: '20px',  // Distância do topo
          right: '20px', // Distância da direita
          width: '350px',  // Ajuste o tamanho conforme necessário
          height: 'auto',
          zIndex: 999,  // Garante que a imagem fique sobre os outros elementos
          border: '3px solid #000', // 👈 cor e espessura da borda
          borderRadius: '12px', 
        }}
      />
        {/* Segunda imagem logo abaixo */}
        <img
          src="/src/assets/image.png"
          alt="Imagem secundária"
          style={{
            position: 'fixed',
            top: '260px',   // distância do topo — ajusta para não sobrepor
            right: '20px',
            width: '200px',
            height: 'auto',
            zIndex: 1000,
            border: '3px solid #000', // 👈 cor e espessura da borda
            borderRadius: '12px', 
          }}
        />
 
      <h1 className="titulo">Monitoramento de Motos</h1>
      <table className="tabela">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Status</th>
            <th>Contador</th>
            <th>Ações</th>
            <th>Posição</th>
          </tr>
        </thead>
        <tbody>
          {motos.length > 0 ? (
            motos.map((moto) => {
              // Obtendo a cor da posição da moto usando o enum
              const corPosicao = posicaoCor[moto.posicao];
 
              return (
                <tr key={moto.id}>
                  <td>{moto.id}</td>
                  <td>{moto.nome}</td>
                  <td>{moto.status}</td>
                  <td>{moto.contador}</td>
                  <td>
                    <button
                      className="btn-alerta"
                      onClick={() => handleAtivarAlerta(moto.id, moto.nome)}
                    >
                      🚨 Ativar Alerta
                    </button>
                  </td>
                  <td
                    style={{
                      backgroundColor: corPosicao,  // A cor da posição
                      width: '15px',                // Tamanho do quadrado
                      height: '15px',               // Tamanho do quadrado
                      borderRadius: '4px',          // Cantos arredondados
                      margin: '0 auto',             // Centralizando o quadrado
                    }}
                  >
                    {/* Podemos mostrar o número da posição ou apenas o quadrado colorido */}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6}>Nenhum dado encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
 
export default App;