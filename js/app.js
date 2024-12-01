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
        // First, request camera permission
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(function(stream) {
                // Permission granted, start the scanner
                html5QrcodeScanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    onScanSuccess,
                    onScanError
                );
            })
            .catch(function(err) {
                console.error("Camera permission denied:", err);
                alert("Por favor, permita o acesso à câmera para usar o scanner.");
            });
    }

    function stopScanning() {
        html5QrcodeScanner.stop().then(() => {
            console.log('Scanner parado');
        }).catch((err) => {
            console.error('Erro ao parar scanner:', err);
        });
    }

    function onScanSuccess(decodedText, decodedResult) {
        const resultContainer = document.getElementById('result');
        const resultText = document.getElementById('result-text');
        
        resultContainer.style.display = 'block';
        resultText.textContent = decodedText;
        resultContainer.classList.add('success-animation');
        
        validateScannedCode(decodedText);
        
        document.getElementById('patrimonio').value = decodedText;
        
        addToHistory(decodedText);
        
        setTimeout(() => {
            resultContainer.classList.remove('success-animation');
        }, 1000);

        if (navigator.vibrate) {
            navigator.vibrate(200);
        }
    }

    function onScanError(error) {
        console.warn(`Erro de código: ${error}`);
    }

    function addToHistory(scannedText) {
        const historyList = document.getElementById('history-list');
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <span>${scannedText}</span>
            <span class="time-stamp">${timeString}</span>
        `;
        
        historyList.insertBefore(historyItem, historyList.firstChild);
    }


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

});
