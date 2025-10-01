import { useEffect, useState } from "react";
import "./App.css";

interface Moto {
  id: number;
  nome: string;
  status: string;
  contador: number;
}

function App() {
  const [motos, setMotos] = useState<Moto[]>([]);

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
      <h1 className="titulo">🚀 Monitoramento de Motos</h1>
      <table className="tabela">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Status</th>
            <th>Contador</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {motos.length > 0 ? (
            motos.map((moto) => (
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
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>Nenhum dado encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
