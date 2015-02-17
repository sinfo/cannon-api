cannon-api
===============
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/sinfo/codename-cannon?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/sinfo/cannon-api.svg)](https://travis-ci.org/sinfo/cannon-api)
[![Dependency Status](https://david-dm.org/sinfo/cannon-api.svg?style=flat)](https://david-dm.org/sinfo/cannon-api)
[![devDependency Status](https://david-dm.org/sinfo/cannon-api/dev-status.svg?style=flat)](https://david-dm.org/sinfo/cannon-api#info=devDependencies)


The Cannon API is (like the name leads you to believe) an API being built at [SINFO](http://sinfo.org) so that our attendees, sponsors and speakers may have the top notch experience they deserve.

Entirely based in [hapi.js](http://hapijs.com) with love!

Built using MongoDB (which must be installed and running to run the API).

### Installation:
  1. Clone the repo: <code>git clone git@github.com:sinfo/cannon-api.git</code>
  2. Enter the directory: <code>cd cannon-api</code>
  3. Install the dependencies: <code>npm install</code> or <code>npm i</code>
  4. Set the environment variables used on <code>config.js</code>
  5. Create the <code>keys</code> and <code>cannon_upload</code> directories (if using the default config)
  6. Generate the the PEM RSA keys:
    
    <code>openssl genrsa -out keys/token.key 1024</code>

    <code>openssl rsa -in keys/token.key -pubout -out keys/token.pub</code>
    
  7. Start the server: <code>npm start</code>


**Note:** If you've managed to break our awesome API you definitley deserve a cookey! So open a Issue/PR or drop us a line at `devteam@sinfo.org` to collect that cookie of yours.
