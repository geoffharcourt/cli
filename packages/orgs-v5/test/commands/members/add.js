'use strict'
/* globals describe it beforeEach afterEach cli nock expect context */

let cmd = require('../../../commands/members/add')
let stubGet = require('../../stub/get')
let stubPut = require('../../stub/put')
const unwrap = require('../../unwrap')

describe('heroku members:add', () => {
  let apiUpdateMemberRole

  beforeEach(() => cli.mockConsole())
  afterEach(() => nock.cleanAll())

  it('is configured for an optional team flag', function () {
    expect(cmd).to.have.own.property('wantsOrg', true)
  })

  context('without the feature flag team-invite-acceptance', () => {
    beforeEach(() => {
      stubGet.teamFeatures([])
    })

    context('and group is a team', () => {
      beforeEach(() => {
        stubGet.teamInfo('team')
      })

      it('does not warn the user when under the free org limit', async () => {
        stubGet.variableSizeTeamMembers(1)
        stubGet.variableSizeTeamInvites(0)
        apiUpdateMemberRole = stubPut.updateMemberRole('foo@foo.com', 'admin')

        await cmd.run({ args: { email: 'foo@foo.com' }, flags: { role: 'admin', team: 'myteam' } })

        expect('').to.eq(cli.stdout);

        expect(`Adding foo@foo.com to myteam as admin... done
`).to.eq(cli.stderr);

        return apiUpdateMemberRole.done()
      })

      it('does not warn the user when over the free org limit', async () => {
        stubGet.variableSizeTeamMembers(7)
        stubGet.variableSizeTeamInvites(0)
        apiUpdateMemberRole = stubPut.updateMemberRole('foo@foo.com', 'admin')

        await cmd.run({ args: { email: 'foo@foo.com' }, flags: { role: 'admin', team: 'myteam' } })

        expect('').to.eq(cli.stdout);

        expect(`Adding foo@foo.com to myteam as admin... done
`).to.eq(cli.stderr);

        return apiUpdateMemberRole.done()
      })

      it('does warn the user when at the free org limit', async () => {
        stubGet.variableSizeTeamMembers(6)
        stubGet.variableSizeTeamInvites(0)
        apiUpdateMemberRole = stubPut.updateMemberRole('foo@foo.com', 'admin')

        await cmd.run({ args: { email: 'foo@foo.com' }, flags: { role: 'admin', team: 'myteam' } })

        expect('').to.eq(cli.stdout);

        expect(unwrap(cli.stderr)).to.equal(`Adding foo@foo.com to myteam as admin... done \
You'll be billed monthly for teams over 5 members.
`);

        return apiUpdateMemberRole.done()
      })
    })

    context('and group is an enterprise org', () => {
      beforeEach(() => {
        stubGet.teamInfo('enterprise')
        stubGet.variableSizeTeamMembers(1)
      })

      it('adds a member to an org', async () => {
        apiUpdateMemberRole = stubPut.updateMemberRole('foo@foo.com', 'admin')

        await cmd.run({ args: { email: 'foo@foo.com' }, flags: { team: 'myteam', role: 'admin' } })

        expect('').to.eq(cli.stdout);

        expect(`Adding foo@foo.com to myteam as admin... done
`).to.eq(cli.stderr);

        return apiUpdateMemberRole.done()
      })
    })
  })

  context('with the feature flag team-invite-acceptance for a team', () => {
    beforeEach(() => {
      stubGet.teamFeatures([{ name: 'team-invite-acceptance', enabled: true }])
      stubGet.teamInfo('team')
    })

    it('does warn the user when free org limit is caused by invites', async () => {
      let apiSendInvite = stubPut.sendInvite('foo@foo.com', 'admin')

      let apiGetOrgMembers = stubGet.variableSizeTeamMembers(1)
      let apiGetTeamInvites = stubGet.variableSizeTeamInvites(5)

      await cmd.run({ args: { email: 'foo@foo.com' }, flags: { role: 'admin', team: 'myteam' } })

      apiSendInvite.done();
      apiGetOrgMembers.done();
      apiGetTeamInvites.done();
      expect('').to.eq(cli.stdout);

      return expect(unwrap(cli.stderr)).to.equal(`Inviting foo@foo.com to myteam as admin... email sent \
You'll be billed monthly for teams over 5 members.
`)
    })

    it('sends an invite when adding a new user to the team', async () => {
      let apiSendInvite = stubPut.sendInvite('foo@foo.com', 'admin')

      stubGet.variableSizeTeamMembers(1)
      stubGet.variableSizeTeamInvites(0)

      await cmd.run({ args: { email: 'foo@foo.com' }, flags: { role: 'admin', team: 'myteam' } })

      expect('').to.eq(cli.stdout);
      expect(`Inviting foo@foo.com to myteam as admin... email sent\n`).to.eq(cli.stderr);

      return apiSendInvite.done()
    })
  })
})
