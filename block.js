(function() {

    const blockedCountries = ['UA', 'US', 'FI', 'CN', 'JP', 'DE', 'ME', 'NO', 'SE', 'FR', 'BY', 'PL', 'KZ', 'LT', 'LV', 'GB', 'ES', 'IT', 'NL', 'KR', 'TR', 'BR', 'CZ', 'HU', 'RO', 'GR', 'IL', 'VN', 'ID', 'CH', 'AT', 'BE', 'RS', 'HR', 'MD', 'EE', 'IE', 'DK', 'TH', 'PH', 'PT', 'PK', 'SA', 'AE', 'MX', 'IS', 'BA', 'BD', 'LK', 'MY', 'LA', 'MN', 'UZ', 'KG', 'TJ', 'TM', 'IR'];

    const translations = {
        'US': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region" },
        'UA': { title: "Доступ обмежено", message: "На жаль, гра недоступна у вашому регіоні" },
        'FI': { title: "Pääsy estetty", message: "Valitettavasti peli ei ole saatavilla alueellasi" },
        'CN': { title: "访问受限", message: "很抱歉，该游戏在您所在的地区不可用" },
        'JP': { title: "アクセスが制限されています", message: "申し訳ありませんが、このゲームはお住まいの地域ではご利用いただけません" },
        'DE': { title: "Zugriff eingeschränkt", message: "Leider ist das Spiel in Ihrer Region nicht verfügbar" },
        'ME': { title: "Pristup ograničen", message: "Nažalost, igra nije dostupna u vašoj regiji" },
        'NO': { title: "Tilgang begrenset", message: "Dessverre er spillet ikke tilgjengelig i din region" },
        'SE': { title: "Åtkomst begränsad", message: "Tyvärr är spelet inte tillgängligt i din region" },
        'FR': { title: "Accès restreint", message: "Malheureusement, le jeu n'est pas disponible dans votre région" },
        'BY': { title: "Доступ абмежаваны", message: "На жаль, гульня недаступная ў вашым рэгіёне" },
        'PL': { title: "Dostęp ograniczony", message: "Niestety, gra nie jest dostępna w Twoim regionie" },
        'KZ': { title: "Қолжетімділік шектелген", message: "Өкінішке орай, ойын сіздің аймағыңызда қолжетімсіз"},
        'LT': { title: "Prieiga apribota", message: "Deja, žaidimas jūsų regione neprieinamas"},
        'LV': { title: "Piekļuve ierobežota", message: "Diemžēl spēle jūsu reģionā nav pieejama"},
        'GB': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region"},
        'ES': { title: "Acceso restringido", message: "Lamentablemente, el juego no está disponible en tu región"},
        'IT': { title: "Accesso limitato", message: "Sfortunatamente, il gioco non è disponibile nella tua regione"},
        'NL': { title: "Toegang beperkt", message: "Helaas is de game niet beschikbaar in jouw regio"},
        'KR': { title: "접근 제한됨", message: "죄송합니다. 이 게임은 귀하의 지역에서 이용할 수 없습니다"},
        'TR': { title: "Erişim Kısıtlandı", message: "Ne yazık ki, oyun bölgenizde mevcut değil"},
        'BR': { title: "Acesso Restrito", message: "Infelizmente, o jogo não está disponível na sua região"},
        'CZ': { title: "Přístup omezen", message: "Hra bohužel není ve vaší oblasti k dispozici"},
        'HU': { title: "Hozzáférés korlátozva", message: "Sajnos a játék nem érhető el az Ön régiójában"},
        'RO': { title: "Acces restricționat", message: "Din păcate, jocul nu este disponibil în regiunea dvs"},
        'GR': { title: "Περιορισμένη πρόσβαση", message: "Δυστυχώς, το παιχνίδι δεν είναι διαθέσιμο στην περιοχή σας"},
        'IL': { title: "הגישה מוגבלת", message: "למרבה הצער, המשחק אינו זמין באזורך"},
        'VN': { title: "Truy cập bị hạn chế", message: "Rất tiếc, trò chơi không khả dụng ở khu vực của bạn"},
        'ID': { title: "Akses Dibatasi", message: "Sayangnya, game ini tidak tersedia di wilayah Anda"},
        'CH': { title: "Zugriff eingeschränkt", message: "Leider ist das Spiel in Ihrer Region nicht verfügbar"},
        'AT': { title: "Zugriff eingeschränkt", message: "Leider ist das Spiel in Ihrer Region nicht verfügbar"},
        'BE': { title: "Toegang beperkt", message: "Helaas is de game niet beschikbaar in jouw regio"},
        'RS': { title: "Приступ ограничен", message: "Нажалост, игра није доступна у вашем региону"},
        'HR': { title: "Pristup ograničen", message: "Nažalost, igra nije dostupna u vašoj regiji"},
        'MD': { title: "Acces restricționat", message: "Din păcate, jocul nu este disponibil în regiunea dvs"},
        'EE': { title: "Juurdepääs piiratud", message: "Kahjuks pole mäng teie piirkonnas saadaval"},
        'IE': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region"},
        'DK': { title: "Adgang begrænset", message: "Desværre er spillet ikke tilgængeligt i din region"},
        'TH': { title: "การเข้าถึงถูกจำกัด", message: "ขออภัย เกมนี้ไม่พร้อมใช้งานในภูมิภาคของคุณ"},
        'PH': { title: "Limitado ang Pag-access", message: "Sa kasamaang palad, hindi available ang laro sa iyong rehiyon"},
        'PT': { title: "Acesso restrito", message: "Infelizmente, o jogo não está disponível na sua região"},
        'MY': { title: "Akses Terhad", message: "Malangnya, permainan ini tidak tersedia di wilayah anda"},
        'PK': { title: "رسائی محدود ہے", message: "بدقسمتی سے، گیم آپ کے علاقے میں دستیاب نہیں ہے"},
        'SA': { title: "الوصول مقيد", message: "لسوء الحظ، اللعبة غير متوفرة في منطقتك"},
        'AE': { title: "الوصول مقيد", message: "لسوء الحظ، اللعبة غير متوفرة في منطقتك"},
        'CA': { title: "Access Restricted", message: "Unfortunately, the game is not available in your region"},
        'MX': { title: "Acceso restringido", message: "Lamentablemente, el juego no está disponible en tu región"},
        'IS': { title: "Aðgangur takmarkaður", message: "Því miður er leikurinn ekki í boði á þínu svæði"},
        'BA': { title: "Pristup ograničen", message: "Nažalost, igra nije dostupna u vašoj regiji"},
        'BD': { title: "অ্যাক্সেস সীমাবদ্ধ", message: "দুঃখিত, আপনার অঞ্চলে গেমটি উপলব্ধ নেই"},
        'LK': { title: "ප්‍රවේශය සීමා කර ඇත", message: "කණගාටුයි, ක්‍රීඩාව ඔබේ කලාපයේ නොමැත"},
        'NP': { title: "पहुँच प्रतिबन्धित", message: "क्षमा गर्नुहोस्, खेल तपाईंको क्षेत्रमा उपलब्ध छैन"},
        'KH': { title: "ការចូលប្រើត្រូវបានដាក់កំហិត", message: "សូមអភ័យទោស ហ្គេមនេះមិនមាននៅក្នុងតំបន់របស់អ្នកទេ"},
        'MM': { title: "အသုံးပြုခွင့် ကန့်သတ်ထားသည်", message: "ဝမ်းနည်းပါသည်၊ ဂိမ်းသည် သင့်ဒေသတွင် မရနိုင်ပါ"},
        'LA': { title: "ການເຂົ້າເຖິງຖືກຈຳກັດ", message: "ຂໍອະໄພ, ເກມນີ້ບໍ່ມີໃຫ້ໃນພາກພື້ນຂອງທ່ານ"},
        'MN': { title: "Хандалт хязгаарлагдсан", message: "Уучлаарай, тоглоом таны бүс нутагт боломжгүй байна"},
        'UZ': { title: "Kirish cheklangan", message: "Afsuski, o'yin sizning mintaqangizda mavjud emas"},
        'KG': { title: "Кирүү чектелген", message: "Тилекке каршы, оюн сиздин аймагыңызда жеткиликсиз"},
        'AZ': { title: "Giriş məhdudlaşdırılıb", message: "Təəssüf ki, oyun bölgənizdə mövcud deyil"},
        'GE': { title: "წვდომა შეზღუდულია", message: "სამწუხაროდ, თამაში თქვენს რეგიონში მიუწვდომელია"},
        'AM': { title: "Մուտքը սահմանափակված է", message: "Ցավոք, խաղը հասանելի չէ ձեր տարածաշրջանում"},
        'TJ': { title: "Дастрасӣ маҳдуд аст", message: "Мутаассифона, бозӣ дар минтақаи шумо дастрас нест"},
        'TM': { title: "Giriş çäklendirilen", message: "Gynansak-da, oýun sebitiňizde elýeterli däl"},
        'IR': { title: "دسترسی محدود شده است", message: "متأسفانه، بازی در منطقه شما در دسترس نیست" }
    };

    const defaultText = {
        title: "Доступ ограничен",
        message: "К сожалению, игра недоступна в вашем регионе"
    };

    document.documentElement.style.visibility = 'hidden';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);

    fetch('https://get.geojs.io/v1/ip/country.json', { signal: controller.signal })
        .then(response => response.json())
        .then(data => {
            const country = String(data.country_code || data.country || '').toUpperCase();

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
            clearTimeout(timer);
            document.documentElement.style.visibility = 'visible';
        });
})();
