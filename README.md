# InsureBlock

This project showcases the use of blockchain in insurance domain for claim processing. In this application, we have two participants, namely insurance and police. Insurance peer is the insurance company providing the insurance for the automobiles and it is responsible for processing the claims. Police peer is responsible for verifying the accident claims.

## Included Components
* Hyperledger Sawtooth
* Docker

<div class="top-screenshot"><img src="./client/public/images/Insur_1.png" style="max-width: 100%; max-height: 35em;"></div>

<div class="top-screenshot"><img src="./client/public/images/Insur_2.png" style="max-width: 100%; max-height: 35em;"></div>

## Prerequisites

* [Hyperledger Sawtooth](https://sawtooth.hyperledger.org/release/) - latest
* [Docker](https://www.docker.com/products) - latest
* [Docker Compose](https://docs.docker.com/compose/overview/) - latest
* [NPM](https://www.npmjs.com/get-npm) - latest
* [Node.js](https://nodejs.org/en/download/) - latest
* [Python](https://www.python.org/downloads/) - ⩾ Version 3.6
* [Git client](https://git-scm.com/downloads) - latest

## 1. Run the application

1. Clone the repository:
```bash
git clone https://gitlab.com/shscs911/integrity.git
```
2. Start the docker containers:
```bash
docker-compose up
```
3. Open a new Terminal tab/window in the same location:
```bash
./keygen.py
```
4. Open the application in a Web Browser:
```
127.0.0.1:8080
```
5. Copy and Paste the output of `Step 3` in the `Private Key` field.

* NB: The password of `Police Login` is `93f583146581d4d153c257ce8d1a858a017d8683dff9fa08a69441f464622a28`