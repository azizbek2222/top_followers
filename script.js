const tg = window.Telegram.WebApp;
const AdController = typeof window.Adsgram !== 'undefined' ? window.Adsgram.init({ blockId: "int-21300" }) : null; 

let coins = 0;
tg.expand();
tg.ready();

// Har bir sahifa yuklanganda balansni va refundni tekshirish
document.addEventListener('DOMContentLoaded', () => {
    tg.CloudStorage.getItem('user_balance', (err, value) => {
        if (value) {
            coins = parseInt(value);
            document.getElementById('coin-count').innerText = coins;
            checkRefunds(); 
        }
    });
});

async function showAd() {
    if (!AdController) return;
    const btn = document.getElementById('ad-btn');
    btn.disabled = true;
    
    AdController.show().then(() => {
        coins += 10;
        saveBalance();
        tg.HapticFeedback.notificationOccurred('success');
        alert("Tabriklaymiz! +10 tanga qo'shildi.");
    }).catch(() => {
        tg.HapticFeedback.notificationOccurred('error');
        alert("Reklama to'liq ko'rilmadi.");
    }).finally(() => {
        btn.disabled = false;
    });
}

function saveBalance() {
    const coinEl = document.getElementById('coin-count');
    if (coinEl) coinEl.innerText = coins;
    tg.CloudStorage.setItem('user_balance', coins.toString());
}

function placeOrder() {
    const usernameInput = document.getElementById('insta-username');
    if (!usernameInput) return;
    
    const username = usernameInput.value;
    if (!username) return alert("Instagram foydalanuvchi nomini yozing!");

    if (coins >= 100) {
        coins -= 100;
        saveBalance();
        
        const order = {
            user: tg.initDataUnsafe.user?.username || "Noma'lum",
            insta: username,
            time: new Date().toLocaleTimeString()
        };

        // Buyurtmalarni saqlash
        tg.CloudStorage.getItem('all_orders', (err, value) => {
            let orders = value ? JSON.parse(value) : [];
            orders.push(order);
            tg.CloudStorage.setItem('all_orders', JSON.stringify(orders));
        });

        tg.HapticFeedback.notificationOccurred('success');
        alert("Buyurtma qabul qilindi!");
        usernameInput.value = "";
        window.location.href = 'index.html'; // Buyurtmadan so'ng bosh sahifaga qaytish
    } else {
        alert("Tangalar yetarli emas!");
    }
}

function checkRefunds() {
    tg.CloudStorage.getItem('rejected_orders', (err, value) => {
        if (value) {
            let rejected = JSON.parse(value);
            const currentUser = tg.initDataUnsafe.user?.username;
            const userRefunds = rejected.filter(o => o.user === currentUser);
            
            if (userRefunds.length > 0) {
                let refundTotal = userRefunds.length * 100;
                coins += refundTotal;
                saveBalance();
                const others = rejected.filter(o => o.user !== currentUser);
                tg.CloudStorage.setItem('rejected_orders', JSON.stringify(others));
                alert(`Sizning buyurtmangiz rad etildi. ${refundTotal} tanga qaytarildi!`);
            }
        }
    });
}
