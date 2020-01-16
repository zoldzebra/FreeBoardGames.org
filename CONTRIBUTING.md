## Commands to know:

`yarn run dev` builds and starts the development **web** server.
`yarn run bgio` builds and starts the **boardgame.io** server.
`yarn run pre` will prepare your changes to be commit to git.  It will automatically format your code and run tests.
NOTE: TravisCI will automatically run various tests (see .travis.yml if interested).  If your tests
`yarn run cyp:update` (alias `cu`) will automatically start a server in the production environment, and update Cypress's stored **snapshots** to reflect your changes.
`yarn run cyp:updatesnapshots` (alias `cus`) automatically update Cypress's stored **snapshots** to reflect your changes.
NOTE: This command will NOT automatically start a server in the production environment.
`yarn run test` runs **Jest unit tests** on all files.




