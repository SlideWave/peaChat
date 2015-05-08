# pchat
Responsive, privately hostable chat and IM software on node.js and mysql

Supports both instant messaging and chat rooms. Layout created with bootstrap.

Live demo at https://pchat.slidewave.com

## Typical setup:

* Have a MySQL instance handy
* git clone https://github.com/ddaeschler/pchat.git
* Go to the pchat directory and edit config.js for your environment spcifying your mysql credentials
and if necessary the full local path to the upload directory (required when using certain init scripts)
* Run node app.js setup to initialize the database
* Start the app using an init script or "node bin/www"
