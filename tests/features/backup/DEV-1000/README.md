# DEV-1000 Flag-Based Fetching Test Scenarios

## Test File Structure

- `DEV_1000_Flag_Based_Fetching_readonly.feature`: Sadece okuma ve karşılaştırma yapan, sistemde değişiklik yapmayan (read-only) senaryoları içerir. Bu dosyadaki testler gerçek sistemde güvenle çalıştırılabilir.
- `DEV_1000_Flag_Based_Fetching_write.feature`: Hata, erişilemezlik, yanlış konfigürasyon gibi sistemin davranışını veya hata durumlarını simüle eden (potansiyel olarak yan etki oluşturabilecek) senaryoları içerir. Bu testler de default olarak mock modda çalışır.

## isTestMode Flag'i

Tüm step definition dosyalarında `isTestMode` flag'i bulunur ve **varsayılan olarak `true`**'dur. Bu modda:
- Gerçek sistem çağrıları, veri yazma/güncelleme işlemleri ve dış sistem entegrasyonları devre dışı bırakılır.
- Mock veri ve simülasyon kullanılır.
- Testler güvenli şekilde, sistemde değişiklik yapmadan çalıştırılır.

Gerçek sistemden veri çekmek veya entegrasyon testleri yapmak isterseniz, ilgili step dosyasında `isTestMode` flag'ini `false` yapabilirsiniz. **Dikkat:** Bu durumda sadece read-only testleri gerçek sistemde çalıştırmanız önerilir.

## Test Çalıştırma Önerileri

- Sadece okuma yapan testler (`*_readonly.feature`) gerçek sistemde çalıştırılabilir.
- Yazma/güncelleme/yan etki oluşturabilecek testler (`*_write.feature`) sadece test/staging ortamında veya mock modda çalıştırılmalıdır.
- Testleri çalıştırmadan önce, endpointlerin ve senaryoların sistemde değişiklik yapmadığından emin olun.

## Güvenlik ve Sorumluluk

- Gerçek sistemde test çalıştırmadan önce, testlerin sadece okuma yaptığından ve veri bütünlüğünü bozmayacağından emin olun.
- Yanlışlıkla veri kaybı, güncelleme veya dış sistemlere mesaj gönderimi gibi risklere karşı dikkatli olun.

---

Herhangi bir sorunuz olursa veya yeni bir senaryo eklemek isterseniz, bu yapıyı takip ederek yeni feature dosyaları oluşturabilirsiniz. 