const AIRTABLE_API_KEY = 'patG7MV5FXpkeFWqS.1fd2aea9e52ee4537eb78f5cc668a4785bd6d2d5118f2a40a8a03d522f72790c'; // Substitua pela sua API Key
const BASE_ID = 'inventario';         // Substitua pelo ID da sua base
const TABLE_NAME = 'Table1';         // Nome da tabela no Airtable
const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

const headers = {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
};

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
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar produto no Airtable:', error);
        return null;
    }
}

async function onScanSuccess(decodedText) {
    const resultContainer = document.getElementById('result');
    const resultText = document.getElementById('result-text');
    const validationMessage = document.getElementById('validation-message');

    resultText.textContent = decodedText;
    resultContainer.style.display = 'block';

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

    addToHistory(decodedText);
}

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

document.getElementById('startButton').addEventListener('click', function () {
    const html5QrcodeScanner = new Html5Qrcode("reader");
    html5QrcodeScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        (error) => console.warn('Erro ao escanear:', error)
    );
});
