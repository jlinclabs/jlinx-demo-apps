#!/usr/bin/env node

import('../server.js').then(module => {
  module.default.start()
})
