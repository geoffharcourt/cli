'use strict'
/* globals describe beforeEach it */

const cli = require('heroku-cli-util')
const nock = require('nock')
const cmd = require('../../../src/commands/maintenance/off')

describe('maintenance:off', function () {
  beforeEach(() => cli.mockConsole())

  it('turns maintenance mode off', async function() {
    let api = nock('https://api.heroku.com:443')
      .patch('/apps/myapp', { maintenance: false })
      .reply(200)
    await cmd.run({ app: 'myapp' })
    return api.done()
  })
})
