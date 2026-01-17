const tg = window.Telegram.WebApp;
const AdController = typeof window.Adsgram !== 'undefined' ? window.Adsgram.init({ blockId: "int-21300" }) : null; 

let coins = 0;
let selectedPackage = null; // { count: 100, price: 800 }

tg.expand();
tg.ready();

document.addEventListener('DOMContentLoaded', () => {
    tg.CloudStorage.getItem('user_balance', (err, value) => {
        if (value) {
            coins = parseInt(value);
            const coinEl = document.getElementById('coin-count');
            if (coinEl) coinEl.innerText = coins;
            checkRefunds(); 
        }
    });
});

// Tarifni tanlash funksiyasi
function selectTariff(element, count, price) {
    // Oldingi tanlovni o'chirish
    document.querySelectorAll('.tariff-card').forEach(card => card.classList.remove('selected'));
    // Yangisini belgilash
    element.classList.add('selected');
    selectedPackage = { count, price };
    tg.HapticFeedback.impactOccurred('light');
}

function saveBalance() {
    const coinEl = document.getElementById('coin-count');
    if (coinEl) coinEl.innerText = coins;
    tg.CloudStorage.setItem('user_balance', coins.toString());
}

function placeOrder() {
    const usernameInput = document.getElementById('insta-username');
    if (!usernameInput) return;
    
    const username = usernameInput.value.trim();
    if (!username) return alert("Instagram foydalanuvchi nomini yozing!");
    if (!selectedPackage) return alert("Iltimos, tariflardan birini tanlang!");

    if (coins >= selectedPackage.price) {
        coins -= selectedPackage.price;
        saveBalance();
        
        const order = {
            user: tg.initDataUnsafe.user?.username || "Noma'lum",
            insta: username,
            amount: selectedPackage.count,
            price: selectedPackage.price,
            time: new Date().toLocaleTimeString()
        };

        tg.CloudStorage.getItem('all_orders', (err, value) => {
            let orders = value ? JSON.parse(value) : [];
            orders.push(order);
            tg.CloudStorage.setItem('all_orders', JSON.stringify(orders));
        });

        tg.HapticFeedback.notificationOccurred('success');
        alert(`Buyurtma qabul qilindi! ${selectedPackage.count} ta obunachi tez orada qo'shiladi.`);
        window.location.href = 'index.html';
    } else {
        tg.HapticFeedback.notificationOccurred('error');
        alert("Tangalaringiz yetarli emas!");
    }
}

// Reklama va Refund funksiyalari o'zgarishsiz qoladi (script.js ichida bo'lishi shart)
async function showAd() {
    if (!AdController) return;
    const btn = document.getElementById('ad-btn');
    if (!btn) return;
    btn.disabled = true;
    AdController.show().then(() => {
        coins += 4;
        saveBalance();
        tg.HapticFeedback.notificationOccurred('success');
    }).catch(() => {
        tg.HapticFeedback.notificationOccurred('error');
    }).finally(() => { btn.disabled = false; });
}

function checkRefunds() {
    tg.CloudStorage.getItem('rejected_orders', (err, value) => {
        if (value) {
            let rejected = JSON.parse(value);
            const currentUser = tg.initDataUnsafe.user?.username;
            const userRefunds = rejected.filter(o => o.user === currentUser);
            if (userRefunds.length > 0) {
                let refundTotal = userRefunds.reduce((sum, o) => sum + (o.price || 100), 0);
                coins += refundTotal;
                saveBalance();
                const others = rejected.filter(o => o.user !== currentUser);
                tg.CloudStorage.setItem('rejected_orders', JSON.stringify(others));
                alert(`Buyurtmangiz rad etildi. ${refundTotal} tanga qaytarildi!`);
            }
        }
    });
}