const puppeteer = require('puppeteer');
const csv = require ('csv-parser');
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
    customFn: (ua) => 'MyCoolAgent/' + ua.replace('Chrome', 'Beer')}))

const tac = [];
let fac = [];
let NewTac = [];

let add = async () =>
{
    let i = 0;
    let t = 0;
    browser = await puppeteerextra.launch();
    
    for(i = 0; i<138218; i++)                
    {
        fac[i] = tac[i].TAC.substring(6,8);
    }

    for(i = 13815; i<87514; i++)            //первая закономерность
    {
        if((fac[i]=='00')&&(fac[i+1]=='01')&&(fac[i+2]=='02')&&(fac[i+3]=='03')&&(fac[i+4]=='04')&&(fac[i+5]=='05')
        &&(fac[i+6]=='06')&&(fac[i+7]=='07')&&(fac[i+8]=='08')&&(fac[i+9]!='09'))
        {
            NewTac[t] = tac[i].TAC.substring(0,6) + '09'; // добавляем так с 09 и 10
            t++;
            NewTac[t] = tac[i].TAC.substring(0,6) + '10';
            t++;
        }
        if((fac[i]=='00')&&(fac[i+1]=='01')&&(fac[i+2]=='02')&&(fac[i+3]=='03')&&(fac[i+4]=='04')&&(fac[i+5]=='05')
        &&(fac[i+6]=='06')&&(fac[i+7]=='07')&&(fac[i+8]!='08'))
        {
            NewTac[t] = tac[i].TAC.substring(0,6) + '08';
            t++;
            NewTac[t] = tac[i].TAC.substring(0,6) + '09'; 
            t++;
            NewTac[t] = tac[i].TAC.substring(0,6) + '10';
            t++;
            // добавляем так с 08, 09 и 10
        }
    }

    for(i = 94021; i < 99451; i++)          //вторая закономерность
    {
        if((fac[i]=='00')&&(fac[i+1]=='01')&&(fac[i+2]=='02')&&(fac[i+3]=='03')&&(fac[i+4]!='04'))
        {
            // добавляем так с 04
            NewTac[t] = tac[i].TAC.substring(0,6) + '04'; 
            t++;
        }
    }

    for(i = 99459; i < 127677; i++)          //четвертая закономерность
    {
        if((fac[i]=='00')&&(fac[i+1]=='01')&&(fac[i+2]=='02')&&(fac[i+3]!='03'))
        {
            // добавляем так с 03, 04 и 05
            NewTac[t] = tac[i].TAC.substring(0,6) + '03';
            t++;
            NewTac[t] = tac[i].TAC.substring(0,6) + '04'; 
            t++;
            NewTac[t] = tac[i].TAC.substring(0,6) + '05';
            t++;
        }
        
        if((fac[i]=='00')&&(fac[i+1]=='01')&&(fac[i+2]=='02')&&(fac[i+3]=='03')&&(fac[i+4]!='04'))
        {
            NewTac[t] = tac[i].TAC.substring(0,6) + '04';
            t++;
            NewTac[t] = tac[i].TAC.substring(0,6) + '05'; 
            t++;
            // добавляем так с 04 и 05
        }

        if((fac[i]=='01')&&(fac[i+1]=='03')&&(fac[i+2]!='04'))
        {
            NewTac[t] = tac[i].TAC.substring(0,6) + '04';
            t++;
            NewTac[t] = tac[i].TAC.substring(0,6) + '05'; 
            t++;
            // добавляем так с 04 и 05
        }
    }

    
        const records =
        [
        ];
        for(i = 0;i<t;i++)
        {
            records[i] = {tac: NewTac[i]}
        }
        csvWriter.writeRecords(records);
    console.log('...Done');
    await browser.close();
}

add();

const csvWriter = createCsvWriter
  ({
    fieldDelimiter: ';',
    path: 'NewTac.csv',
    header: [
      { id: 'tac', title: 'TAC' }
    ]
  });

fs.createReadStream('tac.csv')            
.pipe(csv())
.on('data', (data) => tac.push(data))
.on('end', () =>
{
  console.log('READ');
});
