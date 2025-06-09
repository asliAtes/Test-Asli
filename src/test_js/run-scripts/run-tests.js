const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const xray = require('./xray-integration');

async function runTests(featureFile) {
    console.log(`Running tests for ${featureFile}`);
    
    // Feature file'ı active klasörüne kopyala
    const activeFeaturePath = xray.copyFeatureToActive(featureFile);
    
    // Xray'de test run oluştur
    const testRun = await xray.createTestRun(featureFile);
    console.log(`Created test run: ${testRun.key}`);

    // Testi çalıştır
    exec('npx cucumber-js --format json:reports/cucumber-report.json', async (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            return;
        }

        // Test sonuçlarını oku
        const results = JSON.parse(
            fs.readFileSync('reports/cucumber-report.json', 'utf-8')
        );

        // Sonuçları Xray'e gönder
        await xray.updateTestResults(testRun.key, results);
        console.log('Test results updated in Xray');

        // Feature file'ı backup'a geri taşı
        xray.moveFeatureToBackup(activeFeaturePath);
        console.log(`Moved ${featureFile} back to backup`);
    });
}

// Tek bir feature file için
if (process.argv[2]) {
    runTests(process.argv[2]);
} else {
    // Tüm feature file'lar için
    const featureFiles = xray.getFeatureFiles('tests/features/backup');
    featureFiles.forEach(file => runTests(file));
} 