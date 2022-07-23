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
