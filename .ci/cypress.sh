#!/bin/bash
if [ -z "$CYPRESS_RECORD_KEY" ]
then  # no record key env, so do not record
  echo "Cypress: no record key ENV; not recording"
  yarn run test:cypress
else  # record key env exists, record
  echo "Cypress: record key ENV exists; recording"
  yarn run test:cypress:record
fi