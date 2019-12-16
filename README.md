# SocialPay

## Dependencies

<https://www.docker.com/>

You will need to add a `.env` file in the `backend` folder with the required keys. The file should look something like this:

```bash
TWITTER_CONSUMER_KEY=xxxx
TWITTER_CONSUMER_SECRET=xxxx
JWT_SECRET=testsecret
OWNER_PRIVATE_KEY=xxxx
```

- To acquire twitter keys, sign up for a [developer account on twitter](https://developer.twitter.com/) and create a new app.
  - You **must** change the callback URL appropriately. If you plan on running locally, this should be `localhost:3000/twitter_callback`.
  - Then, copy the consumer API and consumer secret keys into the `.env` file shown above. 
- The JWT secret can be any string.
- `OWNER_PRIVATE_KEY` should be your Zilliqa wallet private key. Testnet keys can be generated [here](https://dev-wallet.zilliqa.com/generate).

## Local build

Ensuring that you have installed docker, build from the image using:

```bash
docker-compose build
```

This might take a while, as there are many things that need to be installed. Once this is done, we can bring up the frontend, backend, and database servers using:

```bash
docker-compose up -d
```

You should see the following messages, followed by setup logs. Keep an eye out for any major erros.

```bash
Starting zil-twitter_mongo_1 ... done
Starting zil-twitter_backend_1 ... done
Starting zil-twitter_frontend_1 ... done
```

If this works, the backend should be running on `localhost:4000`. To interact with the app, go to `http://localhost:3000` in your browser.

## Production build

`sudo docker-compose -f docker-compose.prod.yml build`

`sudo docker-compose -f docker-compose.prod.yml up -d`
