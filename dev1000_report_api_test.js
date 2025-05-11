const axios = require('axios');

const API_URL = 'https://jlyfljojpe.execute-api.us-east-2.amazonaws.com/uscc-dev/report';
const CUSTOMER = 'USCC';
const TEST_DATE = '2025-05-07';

// Helper to print test result
function printResult(tc, passed, details = '') {
  console.log(`\n[${passed ? 'PASS' : 'FAIL'}] ${tc}`);
  if (details) console.log(details);
}

async function runTests() {
  // TC1: Flag=true, MongoDB'den veri çekilmeli (manuel flag değişimi gerekebilir)
  console.log('\nTC1: Flag=true, commType=sms, MongoDB kullanılmalı (flag değişimi/deploy gerekebilir)');
  // Not: Flag değişimi/deploy gerektiren adımlar için açıklama bırakıldı.
  let res1 = await axios.post(API_URL, {
    endDate: TEST_DATE,
    startDate: TEST_DATE,
    customer: CUSTOMER,
    commType: 'sms'
  });
  printResult('TC1', res1.data && res1.data.chartdata && typeof res1.data.chartdata.total === 'number', JSON.stringify(res1.data, null, 2));

  // TC2: Flag=false, PSQL'den veri çekilmeli (manuel flag değişimi gerekebilir)
  console.log('\nTC2: Flag=false, commType=sms, PSQL kullanılmalı (flag değişimi/deploy gerekebilir)');
  // Not: Flag değişimi/deploy gerektiren adımlar için açıklama bırakıldı.
  let res2 = await axios.post(API_URL, {
    endDate: TEST_DATE,
    startDate: TEST_DATE,
    customer: CUSTOMER,
    commType: 'sms'
  });
  printResult('TC2', res2.data && res2.data.chartdata && typeof res2.data.chartdata.total === 'number', JSON.stringify(res2.data, null, 2));

  // TC3: Flag değişip redeploy edilince yeni kaynak kullanılmalı (manuel kontrol)
  console.log('\nTC3: Flag değişip redeploy sonrası yeni kaynak kullanılmalı (manuel kontrol)');
  console.log('Lütfen flag değiştirip Lambda redeploy edin, ardından yukarıdaki iki isteği tekrar çalıştırın ve response değişimini gözlemleyin.');

  // TC4: MongoDB ve PSQL'den aynı kaydın verisi karşılaştırılmalı (manuel karşılaştırma)
  console.log('\nTC4: Her iki flag ile aynı kaydın verisini çekip karşılaştırın. (Manuel karşılaştırma gerekebilir)');

  // TC5: Response'da tüm gerekli alanlar var mı?
  console.log('\nTC5: Response alanları kontrol ediliyor.');
  const requiredFields = ['total', 'delivered', 'pending', 'undelivered', 'carrierError', 'unreachable', 'changed'];
  let missingFields = requiredFields.filter(f => !(f in res1.data.chartdata));
  printResult('TC5', missingFields.length === 0, missingFields.length ? `Eksik alanlar: ${missingFields.join(', ')}` : 'Tüm alanlar mevcut.');

  // TC6: MongoDB unavailable, flag=true (manuel simülasyon)
  console.log('\nTC6: MongoDB unavailable, flag=true (manuel simülasyon gerekebilir)');
  console.log('MongoDB bağlantısını koparıp tekrar deneyin, hata mesajını gözlemleyin.');

  // TC7: PSQL unavailable, flag=false (manuel simülasyon)
  console.log('\nTC7: PSQL unavailable, flag=false (manuel simülasyon gerekebilir)');
  console.log('PSQL bağlantısını koparıp tekrar deneyin, hata mesajını gözlemleyin.');

  // TC8: Invalid/missing flag (manuel veya config ile test)
  console.log('\nTC8: Invalid/missing flag (manuel veya config ile test)');
  console.log('Flag parametresi API bodyde yoksa, Lambda config ile oynanmalı. Yanlış/eksik flag ile davranış gözlemlenmeli.');

  // TC9: Migration sonrası eski veri MongoDB, yeni veri PSQL (manuel veri kontrolü)
  console.log('\nTC9: Migration sonrası eski veri MongoDB, yeni veri PSQL (manuel veri kontrolü gerekebilir)');
  console.log('Migration sonrası eski ve yeni veriyi iki flag ile çekip karşılaştırın.');
}

runTests().catch(e => {
  console.error('Test sırasında hata:', e.message);
}); 