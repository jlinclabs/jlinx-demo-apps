# JLINX DEMO APPS

## Development

```bash
npm i
(cd client && npm i)
```


```
npm run start dev
```


## Deployment

```bash
ssh -A jlinc@interop.jlinc.io
npm i
(cd client && npm i)
# ensure you have a .env
mkdir jlinx.vault
sudo chgrp -hR www-data jlinx.vault/
./scripts/db-migrate
npm run build
```




## Create postgresql database for app

```
CREATE DATABASE blog_hog;
REVOKE ALL ON DATABASE blog_hog FROM public;
CREATE USER blog_hog WITH PASSWORD 'passwordbird';
GRANT CONNECT ON DATABASE blog_hog TO blog_hog;
```
