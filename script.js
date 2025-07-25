// --- Countdown Timer ---
const countdownDate = new Date("May 31, 2026 00:00:00").getTime();
const countdownInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (document.querySelector('.days')) { // Check if elements exist before updating
        document.querySelector('.days').innerHTML = days + "<span>Hari</span>";
        document.querySelector('.hours').innerHTML = hours + "<span>Jam</span>";
        document.querySelector('.minutes').innerHTML = minutes + "<span>Menit</span>";
        document.querySelector('.seconds').innerHTML = seconds + "<span>Detik</span>";
    }

    if (distance < 0) {
        clearInterval(countdownInterval);
        if (document.getElementById('countdown-timer')) {
            document.getElementById('countdown-timer').innerHTML = "Hari Bahagia Telah Tiba!";
        }
    }
}, 1000);

// --- RSVP Form Logic ---
document.addEventListener('DOMContentLoaded', function() {
    const hadirYaRadio = document.getElementById('hadirYa');
    const hadirTidakRadio = document.getElementById('hadirTidak');
    const jumlahHadirContainer = document.getElementById('jumlahHadirContainer');
    const jumlahHadirSelect = document.getElementById('jumlahHadir');
    const rsvpForm = document.getElementById('rsvpForm');

    function toggleJumlahHadir() {
        if (hadirYaRadio.checked) {
            jumlahHadirContainer.style.display = 'block';
            jumlahHadirSelect.setAttribute('required', 'required');
        } else {
            jumlahHadirContainer.style.display = 'none';
            jumlahHadirSelect.removeAttribute('required');
            jumlahHadirSelect.value = '';
        }
    }

    // Initial check on page load
    toggleJumlahHadir();

    // Listen for changes on radio buttons
    hadirYaRadio.addEventListener('change', toggleJumlahHadir);
    hadirTidakRadio.addEventListener('change', toggleJumlahHadir);

    // Handle form submission asynchronously
    rsvpForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(rsvpForm);
        // URL WEB APP GOOGLE APPS SCRIPT UNTUK SUBMIT RSVP (URL yang Anda berikan)
        const GOOGLE_APP_SCRIPT_RSVP_URL = 'https://script.google.com/macros/s/AKfycby5r8isZAtraMYIbX08onLiOHrMwXpp7eL7adaNjvRs8rtWilk2PCEz94A3PEgL4NZo/exec'; 

        fetch(GOOGLE_APP_SCRIPT_RSVP_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors' // Use no-cors for cross-origin form submission
        })
        .then(response => {
            // Setelah berhasil submit, scroll ke bagian pesan/ucapan
            window.location.href = '#messages'; 
            alert('Terima kasih atas konfirmasi kehadiran Anda!'); // Pesan sukses
            rsvpForm.reset(); // Bersihkan formulir
            toggleJumlahHadir(); // Reset visibilitas untuk pengiriman berikutnya
            loadGuestbookMessages(); // Muat ulang pesan untuk menampilkan entri baru
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            alert('Terjadi kesalahan saat mengirim konfirmasi. Mohon coba lagi.');
        });
    });
});

// --- Guestbook/Messages Loading Logic ---
async function loadGuestbookMessages() {
    const messagesContainer = document.querySelector('.messages-container');
    const loadingMessage = document.getElementById('messages-loading');
    const errorMessage = document.getElementById('messages-error');

    messagesContainer.innerHTML = ''; // Bersihkan pesan sebelumnya
    loadingMessage.style.display = 'block';
    errorMessage.style.display = 'none';

    // URL WEB APP GOOGLE APPS SCRIPT UNTUK MEMBACA PESAN (URL yang Anda berikan)
    const GOOGLE_APP_SCRIPT_MESSAGES_URL = 'https://script.google.com/macros/s/AKfycbybqNh4Y6jvDTAxHmP8iZpGcTF0yAtaO75oqUIfnEodmVuqGmrCEzx8WOC7YshvNa6z/exec'; 

    console.log('Mencoba memuat pesan dari:', GOOGLE_APP_SCRIPT_MESSAGES_URL); // Debugging log

    try {
        const response = await fetch(GOOGLE_APP_SCRIPT_MESSAGES_URL);
        console.log('Response status:', response.status); // Debugging log
        console.log('Response status text:', response.statusText); // Debugging log

        if (!response.ok) {
            // Coba baca respons teks meskipun tidak ok, untuk info lebih lanjut
            const errorText = await response.text();
            console.error('HTTP error response body:', errorText); // Debugging log
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText || 'Unknown Error'}`);
        }
        
        // Coba clone response untuk inspeksi jika parsing gagal
        const clonedResponse = response.clone();
        const data = await response.json(); // Asumsikan Apps Script mengembalikan JSON
        console.log('Data yang diterima dari Apps Script:', data); // Debugging log

        loadingMessage.style.display = 'none';

        if (data && data.messages && data.messages.length > 0) {
            // Balik urutan pesan agar yang terbaru muncul di atas
            data.messages.reverse().forEach(msg => { 
                const messageCard = `
                    <div class="message-card">
                        <p class="message-text">"${msg.message}"</p>
                        <p class="message-sender">- ${msg.name || 'Anonim'}</p>
                    </div>
                `;
                messagesContainer.innerHTML += messageCard;
            });
        } else {
            messagesContainer.innerHTML = '<p class="text-center text-gray-500">Belum ada ucapan yang masuk. Jadilah yang pertama!</p>';
        }

    } catch (error) {
        console.error('Error loading guestbook messages:', error); // Debugging log
        // Jika parsing JSON gagal, coba log respons teks mentah
        if (error instanceof SyntaxError && clonedResponse) {
            console.error('Gagal memparsing JSON. Respons teks mentah:', await clonedResponse.text());
        }
        loadingMessage.style.display = 'none';
        errorMessage.style.display = 'block';
    }
}

// Muat pesan saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadGuestbookMessages);


// --- Gifts Modal Logic ---
document.addEventListener('DOMContentLoaded', function() {
    const openGiftModalBtn = document.getElementById('openGiftModal');
    const giftModal = document.getElementById('giftModal');
    const closeModalBtn = document.querySelector('.close-button-modal');
    const copyAccountNumberBtn = document.getElementById('copyAccountNumber');
    const copyConfirmationSpan = document.getElementById('copyConfirmation');

    // Open Modal
    if (openGiftModalBtn) {
        openGiftModalBtn.addEventListener('click', function() {
            giftModal.style.display = 'flex'; // Use flex to center
        });
    }

    // Close Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            giftModal.style.display = 'none';
            copyConfirmationSpan.textContent = ''; // Clear confirmation message
        });
    }

    // Close modal when clicking outside of the modal content
    if (giftModal) {
        giftModal.addEventListener('click', function(event) {
            if (event.target === giftModal) {
                giftModal.style.display = 'none';
                copyConfirmationSpan.textContent = ''; // Clear confirmation message
            }
        });
    }

    // Copy Account Number
    if (copyAccountNumberBtn) {
        copyAccountNumberBtn.addEventListener('click', function() {
            const accountNumber = '8175328137'; // The account number
            // Use document.execCommand('copy') for clipboard functionality in iframes
            const tempInput = document.createElement('textarea');
            tempInput.value = accountNumber;
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
                document.execCommand('copy');
                copyConfirmationSpan.textContent = 'Nomor rekening berhasil disalin!';
            } catch (err) {
                console.error('Gagal menyalin nomor rekening:', err);
                copyConfirmationSpan.textContent = 'Gagal menyalin. Mohon salin manual.';
            }
            document.body.removeChild(tempInput);
        });
    }
});
