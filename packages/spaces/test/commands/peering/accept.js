'use strict'
/* globals describe beforeEach it */

let nock = require('nock')
let cmd = require('../../../commands/peering/accept')
let expect = require('chai').expect
let cli = require('heroku-cli-util')

describe('spaces:peerings:accept', function () {
  beforeEach(() => cli.mockConsole())

  it('accepts a pending peering connection', async function () {
    let api = nock('https://api.heroku.com:443')
      .post('/spaces/my-space/peerings', {
        pcx_id: 'pcx-12345' })
      .reply(202)

    await cmd.run({ flags: { space: 'my-space', 'pcxid': 'pcx-12345' } })

    expect(cli.stdout).to.equal(
      `Accepting and configuring peering connection pcx-12345\n`)

    return api.done()
  })
})
