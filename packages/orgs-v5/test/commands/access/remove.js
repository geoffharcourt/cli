'use strict'
/* globals describe it beforeEach afterEach context cli nock expect */

let cmd = require('../../../commands/access/remove')[0]
let stubDelete = require('../../stub/delete')
let apiDelete

describe('heroku access:remove', () => {
  context('with either a personal or org app', () => {
    beforeEach(() => {
      cli.mockConsole()
      apiDelete = stubDelete.collaboratorsPersonalApp('myapp', 'raulb@heroku.com')
    })
    afterEach(() => nock.cleanAll())

    it('removes the user from an app', async () => {
      await cmd.run({ app: 'myapp', args: { email: 'raulb@heroku.com' } })

      expect('').to.eq(cli.stdout);

      expect(`Removing raulb@heroku.com access from the app myapp... done
`).to.eq(cli.stderr);

      return apiDelete.done()
    })
  })
})
