document.addEventListener('DOMContentLoaded', function() {
    const html5QrcodeScanner = new Html5Qrcode("reader");
    let scanning = false;
    let products = [];

    document.getElementById('startButton').addEventListener('click', function() {
        if (!scanning) {
            startScanning();
            this.textContent = "Parar Scanner";
        } else {
            stopScanning();
            this.textContent = "Iniciar Scanner";
        }
        scanning = !scanning;
    });

    function startScanning() {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(function(stream) {
                html5QrcodeScanner.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    onScanSuccess,
                    onScanError
                );
            })
            .catch(function(err) {
                console.error("Erro:", err);
                alert("Permita o acesso à câmera.");
            });
    }

    function stopScanning() {
        html5QrcodeScanner.stop().then(() => console.log('Scanner parado'));
    }

    function onScanSuccess(decodedText) {
        const resultContainer = document.getElementById('result');
        document.getElementById('result-text').textContent = decodedText;
        resultContainer.style.display = 'block';
    }
});
