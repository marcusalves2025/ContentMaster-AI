const generateBtn = document.getElementById("generate-btn");
const contentTypeSelect = document.getElementById("content-type");
const promptTextarea = document.getElementById("prompt");
const outputContent = document.getElementById("output-content");
const historyList = document.getElementById("history-list");

let historico = JSON.parse(localStorage.getItem("historico")) || [];

function showLoading() {
  outputContent.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Gerando seu conteúdo incrível...</p></div>';
}

async function gerarConteudo(tipo, prompt) {
  try {
    const res = await fetch("http://localhost:3000/api/gerar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, prompt })
    });
    const data = await res.json();
    return data.conteudo || "⚠️ Erro ao gerar conteúdo.";
  } catch (err) {
    console.error(err);
    return "❌ Erro na conexão com o servidor.";
  }
}

function renderHistorico() {
  if (!historyList) return;
  if (historico.length === 0) {
    historyList.innerHTML = "<p>Nenhum conteúdo salvo ainda.</p>";
    return;
  }
  historyList.innerHTML = historico.map((item, index) => `
    <div class="history-item">
      <strong>${item.tipo.toUpperCase()}</strong> <br>
      <small>${item.data}</small>
      <p>${item.conteudo.substring(0, 150)}...</p>
      <button class="btn btn-small" onclick="verHistorico(${index})">🔎 Ver completo</button>
    </div>
  `).join("");
}

function verHistorico(index) {
  const item = historico[index];
  if (!item) return;
  outputContent.innerHTML = `<div class="generated-content">
    <h3 class="content-title">${item.tipo.toUpperCase()}</h3>
    <div class="content-body">${item.conteudo.replace(/\n/g, "<br>")}</div>
    <p><small>Gerado em: ${item.data}</small></p>
  </div>`;
  outputContent.scrollIntoView({ behavior: "smooth" });
}

function salvarHistorico() {
  const contentBody = document.querySelector(".content-body");
  if (!contentBody) { alert("⚠️ Nenhum conteúdo para salvar."); return; }
  const tipo = contentTypeSelect.value;
  const conteudo = contentBody.innerText;
  historico.push({ tipo, conteudo, data: new Date().toLocaleString() });
  localStorage.setItem("historico", JSON.stringify(historico));
  renderHistorico();
  alert("💾 Conteúdo salvo no histórico!");
}

function limparHistorico() {
  if (confirm("Tem certeza que deseja limpar todo o histórico?")) {
    historico = [];
    localStorage.removeItem("historico");
    renderHistorico();
  }
}

function copyToClipboard() {
  const contentBody = document.querySelector(".content-body");
  if (contentBody) {
    navigator.clipboard.writeText(contentBody.innerText);
    alert("✅ Conteúdo copiado!");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderHistorico();
  if (generateBtn) {
    generateBtn.addEventListener("click", async () => {
      const tipo = contentTypeSelect.value;
      const prompt = promptTextarea.value.trim();
      if (!prompt) { alert("Por favor, descreva o que você precisa gerar."); return; }
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
      showLoading();
      const conteudo = await gerarConteudo(tipo, prompt);
      outputContent.innerHTML = `<div class="generated-content">
        <h3 class="content-title">${tipo.toUpperCase()}</h3>
        <div class="content-body">${conteudo.replace(/\n/g, "<br>")}</div>
        <div class="content-actions">
          <button class="btn btn-primary" onclick="copyToClipboard()">📋 Copiar</button>
          <button class="btn btn-outline" onclick="salvarHistorico()">💾 Salvar</button>
        </div>
      </div>`;
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<i class="fas fa-magic"></i> Gerar Conteúdo';
      outputContent.scrollIntoView({ behavior: "smooth" });
    });
  }
});