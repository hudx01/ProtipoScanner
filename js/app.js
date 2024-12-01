const AIRTABLE_API_KEY = 'patG7MV5FXpkeFWqS.1fd2aea9e52ee4537eb78f5cc668a4785bd6d2d5118f2a40a8a03d522f72790c'; // Substitua pela sua API Key
const BASE_ID = 'inventario';         // Substitua pelo ID da sua base
const TABLE_NAME = 'Table1';         // Nome da tabela no Airtable
const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

const headers = {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
};

// Inicializa o scanner do Html5Qrcode
const html5QrcodeScanner = new Html5Qrcode("reader");

// Função para iniciar o scanner
function startScanning() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(() => {
            html5QrcodeScanner.start(
                { facingMode: "environment" }, // Usa a câmera traseira
                {
                    fps: 10,                   // Taxa de quadros por segundo
                    qrbox: { width: 250, height: 250 }, // Área de detecção
                },
                onScanSuccess,                // Função chamada ao detectar código
                onScanError                   // Função chamada ao detectar erro
            );
        })
        .catch((err) => {
            console.error("Erro ao acessar a câmera:", err);
            alert("Por favor, permita o acesso à câmera para usar o scanner.");
        });
}

// Função para parar o scanner
function stopScanning() {
    html5QrcodeScanner.stop()
        .then(() => console.log("Scanner parado"))
        .catch((err) => console.error("Erro ao parar o scanner:", err));
}

// Função chamada ao detectar um código com sucesso
async function onScanSuccess(decodedText) {
    console.log(`Código detectado: ${decodedText}`);

    const resultContainer = document.getElementById('result');
    const resultText = document.getElementById('result-text');
    const validationMessage = document.getElementById('validation-message');

    resultContainer.style.display = 'block';
    resultText.textContent = decodedText;

    // Consulta o produto no Airtable
    const product = await fetchProductFromAirtable(decodedText);

    if (product) {
        resultContainer.classList.remove('result-error');
        resultContainer.classList.add('result-success');
        validationMessage.innerHTML = `
            ✅ Produto encontrado!<br>
            <strong>Patrimônio:</strong> ${product.patrimonio}<br>
            <strong>Setor:</strong> ${product.setor}<br>
            <strong>Descrição:</strong> ${product.descricao}
        `;
    } else {
        resultContainer.classList.remove('result-success');
        resultContainer.classList.add('result-error');
        validationMessage.innerHTML = '❌ Produto não encontrado!';
    }

    // Adiciona o código ao histórico
    addToHistory(decodedText);
}

// Função chamada ao detectar um erro no scanner
function onScanError(error) {
    console.warn(`Erro durante a leitura: ${error}`);
}

// Função para consultar um produto no Airtable
async function fetchProductFromAirtable(code) {
    const filter = `filterByFormula=SEARCH("${code}", {Patrimônio})`;

    try {
        const response = await axios.get(`${AIRTABLE_URL}?${filter}`, { headers });

        if (response.data.records.length > 0) {
            const product = response.data.records[0].fields;
            return {
                patrimonio: product.Patrimônio,
                setor: product.Setor,
                descricao: product.Descrição,
            };
        } else {
            return null; // Produto não encontrado
        }
    } catch (error) {
        console.error("Erro ao buscar produto no Airtable:", error);
        return null;
    }
}

// Função para adicionar um código ao histórico de leituras
function addToHistory(scannedText) {
    const historyList = document.getElementById('history-list');
    const timeString = new Date().toLocaleTimeString();

    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <span>${scannedText}</span>
        <span class="time-stamp">${timeString}</span>
    `;

    historyList.insertBefore(historyItem, historyList.firstChild);
}

// Configuração do botão para iniciar/parar o scanner
document.getElementById('startButton').addEventListener('click', function () {
    const isScanning = this.textContent === "Parar Scanner";

    if (isScanning) {
        stopScanning();
        this.textContent = "Iniciar Scanner";
    } else {
        startScanning();
        this.textContent = "Parar Scanner";
    }
});
