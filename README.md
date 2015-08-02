# pchat
Responsive, privately hostable chat and IM software on node.js and mysql

* Private instant messaging
* Group chat rooms
* Profile images
* Image uploads / inline media in chats
* Full sized image views on click
* User presence status for when a user is active vs not on the app

Layout created with bootstrap.

Live demo at https://pchat.slidewave.com

![Screenshot](/screenshot.png?raw=true)
![Screenshot](/screenshot2.png?raw=true)

## Typical setup:

* Have a MySQL instance handy
* git clone https://github.com/SlideWave/pchat.git
* npm install
* Go to the pchat directory and edit config.js for your environment spcifying your mysql credentials
and if necessary the full local path to the upload directory (required when using certain init scripts)
* Run "node app.js setup" to initialize the database
* Start the app using an init script or "node bin/www"

## Plans:

* CDN Image support
