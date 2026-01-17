const tg = window.Telegram.WebApp;
const AdController = window.Adsgram.init({ blockId: "int-21300" }); 

let coins = 0;
tg.expand();
tg.ready();

// Yuklash
document.addEventListener('DOMContentLoaded', () => {
    tg.CloudStorage.getItem('user_balance', (err, value) => {
        if (value) {
            coins = parseInt(value);
            document.getElementById('coin-count').innerText = coins;
        }
    });
});

async function showAd() {
    const btn = document.getElementById('ad-btn');
    btn.style.opacity = "0.7";
    btn.disabled = true;

    AdController.show().then(() => {
        coins += 10;
        saveBalance();
        tg.HapticFeedback.notificationOccurred('success');
        alert("Tabriklaymiz! +10 tanga");
    }).catch(() => {
        tg.HapticFeedback.notificationOccurred('error');
        alert("Reklama to'liq ko'rilmadi.");
    }).finally(() => {
        btn.style.opacity = "1";
        btn.disabled = false;
    });
}

function saveBalance() {
    document.getElementById('coin-count').innerText = coins;
    tg.CloudStorage.setItem('user_balance', coins.toString());
}

function placeOrder() {
    const username = document.getElementById('insta-username').value;
    if (!username) {
        tg.HapticFeedback.selectionChanged();
        return alert("Username kiriting!");
    }

    if (coins >= 100) {
        coins -= 100;
        saveBalance();

        const order = {
            user: tg.initDataUnsafe.user?.username || "Noma'lum",
            insta: username,
            date: new Date().toISOString()
        };

        // Buyurtmani "Admin" ko'rishi uchun saqlash
        tg.CloudStorage.getItem('all_orders', (err, value) => {
            let orders = value ? JSON.parse(value) : [];
            orders.push(order);
            tg.CloudStorage.setItem('all_orders', JSON.stringify(orders));
        });

        tg.HapticFeedback.notificationOccurred('success');
        alert("Buyurtma qabul qilindi!");
        document.getElementById('insta-username').value = "";
    } else {
        alert("Tangalar yetarli emas!");
    }
}