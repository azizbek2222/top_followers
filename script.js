let coins = 0;
const coinDisplay = document.getElementById('coin-count');
const orderList = document.getElementById('order-list');

// Reklama ko'rish funksiyasi
function watchAd() {
    let btn = document.getElementById('ad-btn');
    btn.disabled = true;
    btn.innerText = "Reklama yuklanmoqda...";

    setTimeout(() => {
        coins += 10;
        coinDisplay.innerText = coins;
        btn.disabled = false;
        btn.innerText = "Reklama ko'rish (+10 tanga)";
        alert("Siz 10 tanga yutib oldingiz!");
    }, 2000); // 2 soniyali reklama simulyatsiyasi
}

// Buyurtma berish funksiyasi
function placeOrder() {
    let username = document.getElementById('insta-username').value;
    
    if (username === "") {
        alert("Iltimos, ismingizni yozing!");
        return;
    }

    if (coins >= 100) {
        coins -= 100;
        coinDisplay.innerText = coins;

        // Admin panelga buyurtma qo'shish
        let li = document.createElement('li');
        li.innerText = `Buyurtma: @${username} (10 obunachi)`;
        orderList.appendChild(li);

        alert("Buyurtma qabul qilindi!");
    } else {
        alert("Tangalaringiz yetarli emas! Yana reklama ko'ring.");
    }
}
