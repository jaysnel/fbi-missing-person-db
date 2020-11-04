//DB Info
const mongodb = require('mongodb');
const mongoclient = mongodb.MongoClient;
const connectionURL = 'mongodb://127.0.0.1:27017';
const databasename = 'fbi-missing-persons';
const nameofcollection = 'missing-persons';

//Web Scraping Info
const puppeteer = require('puppeteer');
const fs = require('fs');
const fbiurl = "https://www.fbi.gov/wanted/kidnap";
let missingpersons = [];
const fbimissingpersondatafileName = "fbimissingpersondata.txt";
const fbimissingpersondetailsfileName = "fbimissingpersondetailsfile.txt"
let fbimissingpersondetails = [];

// function for geting intial links of missing persons from fbi url
let storeInitialFBIData = async () => {
    const browser = await puppeteer.launch({headless: false});
    //const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.goto(fbiurl);
    // https://www.fbi.gov/wanted/kidnap uses lazy loading so
    // im using window.scrollBy() to force all of the elements to load
    await page.evaluate(() => {
        window.scrollBy(0, document.body.scrollHeight);
      });
    // making sure there is enough time for the above to actually run
    await page.waitForTimeout(1000);

    let persons = await page.evaluate(() => Array.from(document.querySelectorAll('.portal-type-person > .title'), element => element.textContent));
    let personslink = await page.evaluate(() => Array.from(document.querySelectorAll('.portal-type-person > .title a'), element => element.getAttribute('href')));
    // creating object to write to a file which contains name of missing person and thier detials link
    persons.forEach((el, idx) =>  {
        missingpersons.push({
            name: removeNewLineCharactersFromPersonsName(el),
            link:  personslink[idx]
        })
    });
    function removeNewLineCharactersFromPersonsName(person) {
        return person.replace(/\n/g, "");
    }

    //maybe theres a better way than writing to a file, but for now this works and gets the job done
    fs.writeFile(fbimissingpersondatafileName, JSON.stringify(missingpersons), err => {
        if(err) console.log(err);
    })
  
    browser.close();
  };

// function for geting details of each missing person from fbi missing person url
  let getPersonsFromFBIData = async (link) => {
    const browser = await puppeteer.launch({headless: false});
    //const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let missingpersonobj = {};
  
    await page.goto(link, { waitUntil: 'networkidle0' });

    let name = await page.evaluate(() => document.querySelector('.documentFirstHeading').textContent);
    let image = await page.evaluate(() => document.querySelector('.wanted-person-mug img').getAttribute('src'));
    let submittip = await page.evaluate(() => document.querySelector('.wanted-person-submit p').textContent);
    let details = await page.evaluate(() => document.querySelector('.wanted-person-details p').textContent);
    let content = await page.evaluate(() => document.querySelector('.wanted-person-description table tbody tr'));
    //fbi data for each person was inside of a table that had no ids or classes,
    //but were the only time they used a table at all on the page
    let allmissingpersoninfo = await page.evaluate(() => Array.from(content.querySelectorAll('td'), element => element.innerHTML));
    
    //creating object of each persons data and pushing it to a global array
    let newcontent = [];
    for(var i = 0; i < allmissingpersoninfo.length; i += 2) {
        newcontent.push(allmissingpersoninfo.slice(i, i + 2));
    }
    newcontent.forEach(el => {
        missingpersonobj[el[0]] = el[1]
    })
    missingpersonobj["Name"] = name;
    missingpersonobj["Details"] = details;
    missingpersonobj["Submit a Tip"] = submittip;
    missingpersonobj["Found"] = false;
    missingpersonobj["Headshot"] = image;
    //pushing to global array
    fbimissingpersondetails.push(missingpersonobj);

    mongoclient.connect(connectionURL, { useUnifiedTopology: true }, (err, client) => {
        if(err) return console.log(err);
        
        const db = client.db(databasename);

        fs.readFile(fbimissingpersondatafileName, (err, data) => {
            if(err) return console.log(err);
            let details = JSON.parse(data);
            if(details.length === fbimissingpersondetails.length) {
                //Clear DB out here
                db.collection(nameofcollection).deleteMany({
                    Found: false
                }, (err) => {
                    if(err) return console.log(err);
                })

                //Inserting each missing person to DB
                db.collection(nameofcollection).insertMany(fbimissingpersondetails, (err) => {
                    if(err) return console.log(err);
                    return false;
                });
                console.log("Saved Missing Persons To DB.");
            }
        })
    })
    //this makes sense right?
    fs.writeFile(fbimissingpersondetailsfileName, JSON.stringify(fbimissingpersondetails), err => {
        if(err) console.log(err);
        console.log("Saved Person.");
    });

    browser.close();
  };

function sortMissingPersonData() {
    fs.readFile(fbimissingpersondatafileName, async (err, data) => {
        if(err) console.log(err);
        let details = JSON.parse(data);
        for(let i = 0; i <= details.length; i++) {
            await getPersonsFromFBIData(details[i].link);
        }
    })
}

async function getalldata() {
    await storeInitialFBIData();
    sortMissingPersonData();
}

getalldata();