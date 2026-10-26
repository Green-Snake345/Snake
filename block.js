(function () {
    'use strict';

    const blockedCountries = new Set([
        'UA', 'US', 'FI', 'CN', 'JP', 'DE', 'ME', 'NO', 'SE', 'FR', 'BY', 'PL',
        'KZ', 'LT', 'LV', 'GB', 'ES', 'IT', 'NL', 'KR', 'TR', 'BR', 'CZ', 'HU',
        'RO', 'GR', 'IL', 'VN', 'ID', 'CH', 'AT', 'BE', 'RS', 'HR', 'MD', 'EE',
        'IE', 'DK', 'TH', 'PH', 'PT', 'PK', 'SA', 'AE', 'MX', 'IS', 'BA', 'BD',
        'LK', 'MY', 'LA', 'MN', 'UZ', 'KG', 'AZ', 'GE', 'AM', 'TJ', 'TM', 'IR',
        'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CG', 
        'CD', 'CI', 'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN', 
        'GW', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 
        'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 
        'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW', 'EH', 'RE', 'YT', 'SH'
    ]);

    const translations = {
        'US': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'GB': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'IE': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'UA': { title: "Доступ обмежено", message: "На жаль, гра недоступна у вашому регіоні" },
        'FI': { title: "Pääsy estetty", message: "Valitettavasti peli ei ole saatavilla alueellasi" },
        'CN': { title: "访问受限", message: "很抱歉，该游戏在您所在的地区不可用" },
        'JP': { title: "アクセスが制限されています", message: "申し訳ありませんが、このゲームはお住まいの地域ではご利用いただけません" },
        'DE': { title: "Zugriff eingeschränkt", message: "Leider ist das Spiel in Ihrer Region nicht verfügbar" },
        'CH': { title: "Zugriff eingeschränkt", message: "Leider ist das Spiel in Ihrer Region nicht verfügbar" },
        'AT': { title: "Zugriff eingeschränkt", message: "Leider ist das Spiel in Ihrer Region nicht verfügbar" },
        'ME': { title: "Pristup ograničen", message: "Nažalost, igra nije dostupna u vašoj regiji" },
        'RS': { title: "Приступ ограничен", message: "Нажалост, игра није доступна у вашем региону" },
        'HR': { title: "Pristup ograničen", message: "Nažalost, igra nije dostupna u vašoj regiji" },
        'BA': { title: "Pristup ograničen", message: "Nažalost, igra nije dostupna u vašoj regiji" },
        'NO': { title: "Tilgang begrenset", message: "Dessverre er spillet ikke tilgjengelig i din region" },
        'SE': { title: "Åtkomst begränsad", message: "Tyvärr är spelet inte tillgängligt i din region" },
        'FR': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'BY': { title: "Доступ абмежаваны", message: "На жаль, гульня недаступная ў вашым рэгіёне" },
        'PL': { title: "Dostęp ograniczony", message: "Niestety, gra nie jest dostępna w Twoim regionie" },
        'KZ': { title: "Қолжетімділік шектелген", message: "Өкінішке орай, ойын сіздің аймағыңызда қолжетімсіз" },
        'LT': { title: "Prieiga apribota", message: "Deja, žaidimas jūsų regione neprieinamas" },
        'LV': { title: "Piekļuve ierobežota", message: "Diemžēl spēle jūsu reģionā nav pieejama" },
        'ES': { title: "Acceso restringido", message: "Lamentablemente, el juego no está disponible en tu región" },
        'MX': { title: "Acceso restringido", message: "Lamentablemente, el juego no está disponible en tu región" },
        'IT': { title: "Accesso limitato", message: "Sfortunatamente, il gioco non è disponibile nella tua regione" },
        'NL': { title: "Toegang beperkt", message: "Helaas is de game niet beschikbaar in jouw regio" },
        'BE': { title: "Toegang beperkt", message: "Helaas is de game niet beschikbaar in jouw regio" },
        'KR': { title: "접근 제한됨", message: "죄송합니다. 이 게임은 귀하의 지역에서 이용할 수 없습니다" },
        'TR': { title: "Erişim Kısıtlandı", message: "Ne yazık ki, oyun bölgenizde mevcut değil" },
        'BR': { title: "Acesso Restrito", message: "Infelizmente, o jogo não está disponível na sua região" },
        'PT': { title: "Acesso restrito", message: "Infelizmente, o jogo não está disponível na sua região" },
        'CZ': { title: "Přístup omezen", message: "Hra bohužel není ve vaší oblasti k dispozici" },
        'HU': { title: "Hozzáférés korlátozva", message: "Sajnos a játék nem érhető el az Ön régiójában" },
        'RO': { title: "Acces restricționat", message: "Din păcate, jocul nu este disponibil în regiunea dvs" },
        'MD': { title: "Acces restricționat", message: "Din păcate, jocul nu este disponibil în regiunea dvs" },
        'GR': { title: "Περιορισμένη πρόσβαση", message: "Δυστυχώς, το παιχνίδι δεν είναι διαθέσιμο στην περιοχή σας" },
        'IL': { title: "הגישה מוגבלת", message: "למרבה הצער, המשחק אינו זמין באזורך" },
        'VN': { title: "Truy cập bị hạn chế", message: "Rất tiếc, trò chơi không khả dụng ở khu vực của bạn" },
        'ID': { title: "Akses Dibatasi", message: "Sayangnya, game ini tidak tersedia di wilayah Anda" },
        'DK': { title: "Adgang begrænset", message: "Desværre er spillet ikke tilgængeligt i din region" },
        'EE': { title: "Juurdepääs piiratud", message: "Kahjuks pole mäng teie piirkonnas saadaval" },
        'TH': { title: "การเข้าถึงถูกจำกัด", message: "ขออภัย เกมนี้ไม่พร้อมใช้งานในภูมิภาคของคุณ" },
        'PH': { title: "Limitado ang Pag-access", message: "Sa kasamaang palad, hindi available ang laro sa iyong rehiyon" },
        'MY': { title: "Akses Terhad", message: "Malangnya, permainan ini tidak tersedia di wilayah anda" },
        'PK': { title: "رسائی محدود ہے", message: "بدقسمتی سے، گیم آپ کے علاقے میں دستیاب نہیں ہے" },
        'SA': { title: "الوصول مقيد", message: "لسوء الحظ، اللعبة غير متوفرة في منطقتك" },
        'AE': { title: "الوصول مقيد", message: "لسوء الحظ، اللعبة غير متوفرة في منطقتك" },
        'IS': { title: "Aðgangur takmarkaður", message: "Því miður er leikurinn ekki í boði á þínu svæði" },
        'BD': { title: "অ্যাক্সেস সীমাবদ্ধ", message: "দুঃখিত, আপনার অঞ্চলে গেমটি উপলব্ধ নেই" },
        'LK': { title: "ප්‍රවේශය සීමා කර ඇත", message: "කණගාටුයි, ක්‍රීඩාව ඔබේ කලාපයේ නොමැත" },
        'LA': { title: "ການເຂົ້າເຖິງຖືກຈຳກັດ", message: "ຂໍອະໄພ, ເກມນີ້ບໍ່ມີໃຫ້ໃນພາກພື້ນຂອງທ່ານ" },
        'MN': { title: "Хандалт хязгаарлагдсан", message: "Уучлаарай, тоглоом таны бүс нутагт боломжгүй байна" },
        'UZ': { title: "Kirish cheklangan", message: "Afsuski, o'yin sizning mintaqangizda mavjud emas" },
        'KG': { title: "Кирүү чектелген", message: "Тилекке каршы, оюн сиздин аймагыңызда жеткиликсиз" },
        'AZ': { title: "Giriş məhdudlaşdırılıb", message: "Təəssüf ki, oyun bölgənizdə mövcud deyil" },
        'GE': { title: "წვდომა შეზღუდულია", message: "სამწუხაროდ, თამაში თქვენს რეგიონში მიუწვდომელია" },
        'AM': { title: "Մուտքը սահմանափակված է", message: "Ցավոք, խաղը հասանելի չէ ձեր տարածաշրջանում" },
        'TJ': { title: "Дастрасӣ маҳдуд аст", message: "Мутаассифона, бозӣ дар минтақаи шумо дастрас нест" },
        'TM': { title: "Giriş çäklendirilen", message: "Gynansak-da, oýun sebitiňizde elýeterli däl" },
        'IR': { title: "دسترسی محدود شده است", message: "متأسفانه، بازی در منطقه شما در دسترس نیست" },
        'DZ': { title: "الوصول مقيد", message: "لسوء الحظ، اللعبة غير متوفرة في منطقتك" },
        'EG': { title: "الوصول مقيد", message: "لسوء الحظ، اللعبة غير متوفرة في منطقتك" },
        'LY': { title: "الوصول مقيد", message: "لسوء الحظ، اللعبة غير متوفرة في منطقتك" },
        'MA': { title: "الوصول مقيد", message: "لسوء الحظ، اللعبة غير متوفرة في منطقتك" },
        'SD': { title: "الوصول مقيد", message: "لسوء الحظ، اللعبة غير متوفرة في منطقتك" },
        'TN': { title: "الوصول مقيد", message: "لسوء الحظ، اللعبة غير متوفرة في منطقتك" },
        'EH': { title: "الوصول مقيد", message: "لسوء الحظ، اللعبة غير متوفرة في منطقتك" },
        'BJ': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'BF': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'BI': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'CM': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'CF': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'TD': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'KM': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'CG': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'CD': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'CI': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'DJ': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'GA': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'GN': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'MG': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'ML': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'MR': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'MU': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'RW': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'SN': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'TG': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'RE': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'YT': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'AO': { title: "Acesso Restrito", message: "Infelizmente, o jogo não está disponível na sua região" },
        'CV': { title: "Acesso Restrito", message: "Infelizmente, o jogo não está disponível na sua região" },
        'GW': { title: "Acesso Restrito", message: "Infelizmente, o jogo não está disponível na sua região" },
        'MZ': { title: "Acesso Restrito", message: "Infelizmente, o jogo não está disponível na sua região" },
        'ST': { title: "Acesso Restrito", message: "Infelizmente, o jogo não está disponível na sua região" },
        'BW': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'SZ': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'ER': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'ET': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'GM': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'GH': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'KE': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'LS': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'LR': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'MW': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'NA': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'NG': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'SC': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'SL': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'SO': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'ZA': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'SS': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'TZ': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'UG': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'ZM': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'ZW': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'SH': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" }
    };

    const defaultText = {
        title: "Доступ ограничен",
        message: "К сожалению, игра недоступна в вашем регионе"
    };

    const API_URL = 'https://get.geojs.io/v1/ip/country.json';
    const TIMEOUT_MS = 3000;

    const root = document.documentElement;
    root.style.visibility = 'hidden';

    let timer = null;
    let done = false;

    function restore() {
        if (done) return;
        done = true;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        root.style.visibility = 'visible';
    }

    function renderBlock(text) {
        const html = `
            <div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#0b1020; color:white; font-family:'Microsoft YaHei','PingFang SC','Hiragino Sans','Yu Gothic','Noto Sans SC','Noto Sans JP',sans-serif; text-align:center; padding:20px;">
                <div>
                    <h1 style="color:#ff4444; margin-bottom:10px; font-size:32px;">${text.title}</h1>
                    <p style="font-size:18px; opacity:0.8;">${text.message}</p>
                </div>
            </div>
        `;

        if (document.body) {
            document.body.innerHTML = html;
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.innerHTML = html;
            }, { once: true });
        }
    }

    try {
        if (typeof fetch !== 'function') {
            throw new Error('fetch не поддерживается');
        }

        let controller = null;
        if (typeof AbortController !== 'undefined') {
            controller = new AbortController();
            timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        }

        fetch(API_URL, controller ? { signal: controller.signal } : undefined)
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                const country = String(data.country_code || data.country || '').toUpperCase();

                if (blockedCountries.has(country)) {
                    const text = translations[country] || defaultText;
                    renderBlock(text);
                }
            })
            .catch(e => {
                console.log('Ошибка проверки геолокации:', e);
            })
            .finally(() => {
                restore();
            });
    } catch (e) {
        console.log('Ошибка инициализации геоблокировки:', e);
        restore();
    }
})();
