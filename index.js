require('dotenv').config()

const puppeteer = require('puppeteer');

const readline = require('readline');

const OS = ["Android", "iOS"]
const ENV = ["Dev", "Test"]

const androidDevString = `${OS[0]}-${ENV[0]}`
const androidTestString = `${OS[0]}-${ENV[1]}`
const iosDevString = `${OS[1]}-${ENV[0]}`
const iosTestString = `${OS[1]}-${ENV[1]}`

const envToCreate = {
  androidDev: false,
  androidTest: false,
  iosDev: false,
  iosTest: true
}

const cookiesArray = JSON.parse(process.env.COOKIES_ARRAY) || []


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Branch: ", async function(branch) {

  const androidDev = createAppCenterUrl(androidDevString, branch)
  const androidTest = createAppCenterUrl(androidTestString, branch)
  const iosDev = createAppCenterUrl(iosDevString, branch)
  const iosTest = createAppCenterUrl(iosTestString, branch)

    if(envToCreate.androidDev){
      await createBuildForBranch(androidDev)
    }
    if(envToCreate.androidTest){
      await createBuildForBranch(androidTest)
    }
    if(envToCreate.iosDev){
      await createBuildForBranch(iosDev)
    }
    if(envToCreate.iosTest){
      await createBuildForBranch(iosTest)
    }
      rl.close();
});

function createAppCenterUrl (OS_ENV, url){
  const branchToArray = url.split("/")

  return {
    url: `${process.env.APPCENTER_URL_1}${OS_ENV}${process.env.APPCENTER_URL_2}${branchToArray[0]}%2F${branchToArray[1]}`,
    OS_ENV
  }
}

async function createBuildForBranch(appCenterData){

  const {url, OS_ENV} = appCenterData

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const timeout = 999999999;
  page.setDefaultTimeout(timeout);

  
    try {
      console.log(`Starting build for: ${OS_ENV}... ` )
      await page.setCookie(...cookiesArray);
      await page.cookies(url); 
  
      await page.goto(url);
      // _3ZPOfyk4x _73O7sIPMx
      // Loading spinner
      await page.waitForSelector('._3ZPOfyk4x', { hidden: true });
  
      //If is not cloned, clone it
        try{
            await page.click('button[data-test-class="button trigger"]');
            await page.click('div[data-test-class="dropdown-list-item"]');
            await page.click('input[type="radio"][value="develop"]');
  
            const [button] = await page.$x("//button[contains(., 'Clone')]");
              if (button) {
                  await button.click();
              }
        }catch(e){
          console.log("error branch:", e)
        }
      // Wait for build button
      await page.waitForSelector('button[data-test-id="build-now-button"]');
      await page.click('button[data-test-id="build-now-button"]');

      console.log(`Build for ${OS_ENV} has finished`)
    } catch (err) {
      console.error("error:", err);
    } finally {
      
      await browser.close();
  
    }
  
};




