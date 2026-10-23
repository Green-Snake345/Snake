(function() {
    const blockedCountries = ['UA', 'US', 'FI']; 

    // Словарь с переводами для заблокированных стран
    const translations = {
        'US': { 
            title: "Access Restricted", 
            message: "Unfortunately, the game is not available in your region." 
        },
        'UA': { 
            title: "Доступ обмежено", 
            message: "На жаль, гра недоступна у вашому регіоні." 
        },
        'FI': { 
            title: "Pääsy estetty", 
            message: "Valitettavasti peli ei ole saatavilla alueellasi." 
        }
    };

    const defaultText = { 
        title: "Доступ ограничен", 
        message: "К сожалению, игра недоступна в вашем регионе." 
    };

    fetch('https://get.geojs.io/v1/ip/country.json')
        .then(response => response.json())
        .then(data => {
            const country = data.country;
            
            if (blockedCountries.includes(country)) {
                // Выбираем перевод для текущей страны (или стандартный русский)
                const text = translations[country] || defaultText;

                document.documentElement.innerHTML = `
                    <div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#0b1020; color:white; font-family:sans-serif; text-align:center; padding: 20px;">
                        <div>
                            <h1 style="color: #ff4444; margin-bottom: 10px; font-size: 32px;">${text.title}</h1>
                            <p style="font-size: 18px; opacity: 0.8;">${text.message}</p>
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.log('Ошибка проверки геолокации:', error);
        });
})();
