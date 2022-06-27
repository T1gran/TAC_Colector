const puppeteer = require('puppeteer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { normalize } = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const puppeteerextra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteerextra.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
puppeteerextra.use(AdblockerPlugin({ blockTrackers: true }))

//puppeteerextra.use(require('puppeteer-extra-plugin-anonymize-ua')())
puppeteerextra.use(require('puppeteer-extra-plugin-anonymize-ua')({
    customFn: (ua) => 'MyCoolAgent/' + ua.replace('Chrome', 'Beer')
})
)

const tac = [];

let LuneAlgorithm = (serialNumber, i) => {
    let imei = tac[i].TAC + serialNumber;
    let Cn = 0;
    let j = 0;
    let even = [];
    let q = 0;
    Cn = Number(imei[0]) + Number(imei[2]) + Number(imei[4]) + Number(imei[6]) + Number(imei[8]) + Number(imei[10]) + Number(imei[12]);
    for (q = 1; q < 14; q += 2) {
        switch (imei[q]) {
            case '0':
                even[j] = 0;
                break;

            case '1':
                even[j] = 2;
                break;

            case '2':
                even[j] = 4;
                break;

            case '3':
                even[j] = 6;
                break;

            case '4':
                even[j] = 8;
                break;

            case '5':
                even[j] = 1;
                break;

            case '6':
                even[j] = 3;
                break;

            case '7':
                even[j] = 5;
                break;

            case '8':
                even[j] = 7;
                break;

            case '9':
                even[j] = 9;
                break;
        }
        j++;
    }
    for (q = 0; q < 7; q++) {
        Cn += even[q];
    }
    LastCn = Cn % 10;
    Cn = 10 - LastCn;
    if (Cn == 10) Cn = 0;
    return Cn;
}

let scrape = async () => {
    let result = [];
    const browser = await puppeteerextra.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultTimeout(500000);
    for (let i = 0; i < 3; i++) {
        await page.goto('https://www.imei.info/');
        let Cn = 0;
        let serialNumber = '000000';
        Cn = LuneAlgorithm(serialNumber, i);
        let FullIMEI = tac[i].TAC + serialNumber + Cn;
        await page.waitForSelector("#id_imei");
        await page.type('#id_imei', FullIMEI);
        await page.waitFor(() =>
            document.querySelectorAll('#general_imei_info > table > tbody > tr:nth-child(2) > td, body > div.site-hero > div > div > div > div > h1').length
        );
        const exist = await page.evaluate(() => {
            let exist = document.querySelector('#general_imei_info > table > tbody > tr:nth-child(2) > td');
            return exist;
        });
        if (exist != null) {
            result [i] = await page.evaluate(() => {
                let brandName = document.querySelector('#general_imei_info > table > tbody > tr:nth-child(2) > td').innerText;
                let modelName = document.querySelector('#general_imei_info > table > tbody > tr:nth-child(1) > td').innerText;
                let IMEI = document.querySelector('#general_imei_info > table > tbody > tr:nth-child(3) > td').innerText;
                return {
                    IMEI,
                    brandName,
                    modelName
                }
            });
            const records =
            [
                {imei: result[i].IMEI, brand: result[i].brandName, model: result[i].modelName}
            ];
            csvWriter.writeRecords(records);
        }
        else {
            let brandName = 'Not Exist';
            let modelName = 'Not Exist';
            let IMEI = 'Not Exist';
            result [i] = [brandName, modelName, IMEI];
            const records =
            [
                {imei: result[i].IMEI, brand: result[i].brandName, model: result[i].modelName}
            ];
            csvWriter.writeRecords(records);
        }
    }
    await browser.close();
}

fs.createReadStream('NewTac.csv')
    .pipe(csv())
    .on('data', (data) => tac.push(data))
    .on('end', () => {
        //TacCheck();
    });



const csvWriter = createCsvWriter
    ({
        fieldDelimiter: ';',
        path: 'Step2.csv',
        header: [
            { id: 'imei', title: 'IMEI' },
            { id: 'brand', title: 'BRAND' },
            { id: 'model', title: 'MODEL' }
        ]
    });

scrape();