# DEV-1000 Manual Test Cases: Flag-Based Fetching Logic for Communication Reports (Email Case)

## TC1: Flag=true, MongoDB'den veri çekilmeli
- **Amaç:** Flag true iken, API'den veri çekildiğinde MongoDB kullanıldığını doğrulamak.
- **Adımlar:**
  1. Lambda'nın flag ayarını `true` yapın (gerekirse redeploy edin).
  2. Aşağıdaki body ile POST isteği atın:
     ```json
     {
       "endDate": "2025-05-07",
       "startDate": "2025-05-07",
       "customer": "USCC",
       "commType": "sms"
     }
     ```
  3. Response'u inceleyin.
- **Beklenen Sonuç:**
  - `chartdata` ve `cumulativedata` alanları dönmeli.
  - Veri MongoDB'den gelmeli (DB loglarından veya backend ekibinden teyit alınabilir).
- **Not:** Flag değişimi için devops veya backend desteği gerekebilir.

---

## TC2: Flag=false, PSQL'den veri çekilmeli
- **Amaç:** Flag false iken, API'den veri çekildiğinde PSQL kullanıldığını doğrulamak.
- **Adımlar:**
  1. Lambda'nın flag ayarını `false` yapın (gerekirse redeploy edin).
  2. TC1'dekiyle aynı body ile POST isteği atın.
  3. Response'u inceleyin.
- **Beklenen Sonuç:**
  - Veri PSQL'den gelmeli (DB loglarından veya backend ekibinden teyit alınabilir).

---

## TC3: Flag değişip redeploy edilince yeni kaynak kullanılmalı
- **Amaç:** Flag değişikliğinin hemen etkili olduğunu doğrulamak.
- **Adımlar:**
  1. Önce TC1 veya TC2'yi çalıştırın, response'u kaydedin.
  2. Flag'i değiştirip Lambda'yı redeploy edin.
  3. Aynı body ile tekrar istek atın.
  4. Response'u karşılaştırın.
- **Beklenen Sonuç:**
  - Veri kaynağı değişmeli, response farklı olmalı.

---

## TC4: MongoDB ve PSQL'den aynı kaydın verisi karşılaştırılmalı
- **Amaç:** Migration sonrası aynı kaydın iki DB'deki verisinin tutarlılığını kontrol etmek.
- **Adımlar:**
  1. Hem flag=true hem flag=false ile aynı body ile istek atın.
  2. Response'ları karşılaştırın.
- **Beklenen Sonuç:**
  - Alanlar ve değerler tutarlı olmalı.
- **Not:** Migration sonrası test için uygundur.

---

## TC5: Response'da tüm gerekli alanlar var mı?
- **Amaç:** API response'unda tüm zorunlu alanların olup olmadığını kontrol etmek.
- **Adımlar:**
  1. Herhangi bir flag ile API'ye istek atın.
  2. Response'da `chartdata` içinde şu alanları kontrol edin: `total`, `delivered`, `pending`, `undelivered`, `carrierError`, `unreachable`, `changed`.
- **Beklenen Sonuç:**
  - Tüm alanlar eksiksiz dönmeli.

---

## TC6: MongoDB unavailable, flag=true
- **Amaç:** MongoDB erişilemezken API'nin doğru hata dönüp dönmediğini test etmek.
- **Adımlar:**
  1. Flag'i true yapın.
  2. MongoDB bağlantısını (geçici olarak) kesin veya simüle edin.
  3. API'ye istek atın.
- **Beklenen Sonuç:**
  - Anlamlı bir hata mesajı dönmeli (ör. DB bağlantı hatası).
- **Not:** DB erişimi için backend/devops desteği gerekebilir.

---

## TC7: PSQL unavailable, flag=false
- **Amaç:** PSQL erişilemezken API'nin doğru hata dönüp dönmediğini test etmek.
- **Adımlar:**
  1. Flag'i false yapın.
  2. PSQL bağlantısını (geçici olarak) kesin veya simüle edin.
  3. API'ye istek atın.
- **Beklenen Sonuç:**
  - Anlamlı bir hata mesajı dönmeli.
- **Not:** DB erişimi için backend/devops desteği gerekebilir.

---

## TC8: Invalid/missing flag value
- **Amaç:** Flag eksik veya geçersizse API'nin davranışını test etmek.
- **Adımlar:**
  1. Lambda'nın flag ayarını silin veya geçersiz bir değer verin.
  2. API'ye istek atın.
- **Beklenen Sonuç:**
  - API default davranış sergilemeli veya hata dönmeli.
- **Not:** Lambda config değişikliği gerekebilir.

---

## TC9: Migration sonrası eski veri MongoDB, yeni veri PSQL'den erişilebilmeli
- **Amaç:** Migration sonrası eski ve yeni verinin doğru kaynaktan çekilebildiğini doğrulamak.
- **Adımlar:**
  1. Migration öncesi ve sonrası birer kayıt belirleyin.
  2. Flag=true ile eski kaydı, flag=false ile yeni kaydı çekin.
- **Beklenen Sonuç:**
  - Eski veri MongoDB'den, yeni veri PSQL'den gelmeli.
- **Not:** Migration tarihi ve örnek kayıtlar backend'den alınmalı. 