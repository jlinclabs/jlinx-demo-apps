#!/usr/bin/env bash

exec ./node_modules/.bin/knex --esm --knexfile ./knexfile.cjs $@
