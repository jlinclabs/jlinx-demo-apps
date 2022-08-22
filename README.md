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

```bash
git init
git remote add origin git@github.com:jlinclabs/jlinx-demo-apps.git
git fetch
git checkout create-react-app
npm i && (cd client/ && npm i)

mkdir uploads
sudo chgrp -hR www-data uploads

vi .env
npm run build
sudo -u postgres psql
```

```sql
CREATE DATABASE panda_pod;
REVOKE ALL ON DATABASE panda_pod FROM public;
CREATE USER panda_pod WITH PASSWORD 'passwordbird';
GRANT CONNECT ON DATABASE panda_pod TO panda_pod;
```

```bash
npx prisma db push
sudo vi /etc/nginx/sites-available/hobit-hub
```
