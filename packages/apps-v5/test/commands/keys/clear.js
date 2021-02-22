'use strict'
/* globals commands describe beforeEach afterEach it */

const cli = require('heroku-cli-util')
const nock = require('nock')
const expect = require('chai').expect
const cmd = commands.find((c) => c.topic === 'keys' && c.command === 'clear')

describe('keys:clear', () => {
  beforeEach(() => cli.mockConsole())
  afterEach(() => nock.cleanAll())

  it('removes all SSH keys', async () => {
    let api = nock('https://api.heroku.com:443')
      .get('/account/keys')
      .reply(200, [{ id: 1 }, { id: 2 }])
      .delete('/account/keys/1').reply(200)
      .delete('/account/keys/2').reply(200)

    await cmd.run({ args: { key: 'user@machine' } })

    expect('').to.equal(cli.stdout);
    expect('Removing all SSH keys... done\n').to.equal(cli.stderr);

    return api.done()
  })
})
