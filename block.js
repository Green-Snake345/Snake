(function() {
    
    const blockedCountries = ['UA', 'US', 'FI', 'CN', 'JP'];

    const translations = {
        'US': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'UA': { title: "Доступ обмежено", message: "На жаль, гра недоступна у вашому регіоні" },
        'FI': { title: "Pääsy estetty", message: "Valitettavasti peli ei ole saatavilla alueellasi" },
        'CN': { title: "访问受限", message: "很抱歉，该游戏在您所在的地区不可用" },
        'JP': { title: "アクセスが制限されています", message: "申し訳ありませんが、このゲームはお住まいの地域ではご利用いただけません" },
        'DE': { title: "Zugriff eingeschränkt", message: "Leider ist das Spiel in Ihrer Region nicht verfügbar" }
    };

    const defaultText = { 
        title: "Доступ ограничен", 
        message: "К сожалению, игра недоступна в вашей стране" 
    };

    document.documentElement.style.visibility = 'hidden';

    fetch('https://get.geojs.io/v1/ip/country.json')
        .then(response => response.json())
        .then(data => {
            const country = data.country;
            
            if (blockedCountries.includes(country)) {
                const text = translations[country] || defaultText;

                document.body.innerHTML = `
                    <div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#0b1020; color:white; font-family:sans-serif, 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans', 'Yu Gothic', 'Noto Sans SC', 'Noto Sans JP'; text-align:center; padding:20px;">
                        <div>
                            <h1 style="color:#ff4444; margin-bottom:10px; font-size:32px;">${text.title}</h1>
                            <p style="font-size:18px; opacity:0.8;">${text.message}</p>
                        </div>
                    </div>
                `;
            }
        })
        .catch(e => {
            console.log('Ошибка проверки геолокации:', e);
        })
        .finally(() => {
            document.documentElement.style.visibility = 'visible';
        });
})();
