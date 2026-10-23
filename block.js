(function() {
    const blockedCountries = ['UA', 'US']; 

    fetch('https://get.geojs.io/v1/ip/country.json')
        .then(response => response.json())
        .then(data => {
            if (blockedCountries.includes(data.country)) {
                document.documentElement.innerHTML = `
                    <div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#0b1020; color:white; font-family:sans-serif; text-align:center; padding: 20px;">
                        <div>
                            <h1 style="color: #ff4444; margin-bottom: 10px; font-size: 32px;">Доступ ограничен</h1>
                            <p style="font-size: 18px; opacity: 0.8;">К сожалению, игра недоступна в вашем регионе.</p>
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.log('Ошибка проверки геолокации:', error);
        });
})();
