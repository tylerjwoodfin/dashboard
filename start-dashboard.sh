#!/bin/bash

# used as a service to continuously run the dashboard without maintaining a separate terminal
cd /var/www/html/dashboard
forever start -c "npm start" .