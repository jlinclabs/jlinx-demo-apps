#!/usr/bin/env node

import findPort from 'find-open-port'

findPort().then(port => { console.log(port) })
