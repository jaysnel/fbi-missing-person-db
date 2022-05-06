# fbi-missing-person-db

This is a project to make more aware of missing children. This project uses googles puppeteer to go out and scrape https://www.fbi.gov/wanted/kidnap to gather information on current missing children. This data is scraped and stored in mongoDB, then used to provide a public facing api for other developers to use.

This project is for non-commercial, and not for profit.

Currently, it is not set to run automatically but will be set to either weekly or monthly with ```v2```. Last updated: ```05/04/2022```.

To run locally:

1. Pull down https://github.com/jaysnel/fbi-missing-person-db 

2. cd into ```fbi-missing-person-db``` and run ```npm install```

3. Create an account at https://www.mongodb.com/ if you do not already have one

4. Within mongoDB you will need to create a cluster that will incldue a database and a collection.(Tuturial is coming soon)

5. cd into ```fbi-missing-person-db``` and create a ```.env``` file within the directory and add:
```
CLUSTER_USERNAME=******
CLUSTER_PASSWORD=******
DATABASE_NAME=******
COLLECTION_NAME=******
```
replacing ```******``` with your own values

If you do not wish to use twilio for SMS alerting, remove lines ```13-18```, ```117-120``` and ```129-140``` inside of ```fbi-missing-person-db/serve.js``` to avoid errors.

If you wish to use twilio for SMS alerting, add the following along with the ```.env``` file in ```fbi-missing-person-db```:

```
TWILIOPHONENUMBER=******
PHONENUMBER=******
ACCOUNTSID=******
AUTHTOKEN=******
```
replacing ```******``` with your own values

6. cd into ```fbi-missing-person-db``` and run ```node serve.js```. 
This will bring up a browser window for each person. This can be annoying at times. So to avoid, you can comment out line ```75``` and uncomment line ```76```. 

7. Check your DB to make sure values were added.