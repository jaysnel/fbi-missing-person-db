# fbi-missing-person-db

Run script with: ```node serve.js```

This is a project to make more aware of missing children. This project uses googles puppeteer to go out and scrape https://www.fbi.gov/wanted/kidnap to gather information on current missing children. This data is scraped and stored in mongoDB, then used to provide a public facing api for other developers to use.

This project is for non-commercial, and not for profit.

Currently, it is not set to run automatically but will be set to either weekly or monthly with ```v2```. Last updated: ```05/04/2022```.

You will need these environment variables for the script to run succesfully:

mongoDB:
```
CLUSTER_USERNAME=******
CLUSTER_PASSWORD=******
DATABASE_NAME=******
COLLECTION_NAME=******
```

Twillio:
```
TWILIOPHONENUMBER=******
PHONENUMBER=******
ACCOUNTSID=******
AUTHTOKEN=******
```

If you do not wish to use twilio, remove lines ```13-18```, ```117-120``` and ```129-140``` to avoid errors.