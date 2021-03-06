import ADAuth from '../../../lib/adauth'

let auth: ADAuth

beforeEach(async () => {
  auth = await ADAuth.create({
    url: 'ldap://ldap.forumsys.com:389',
    domainDN: 'dc=example,dc=com',
    searchBase: 'dc=example,dc=com',
    // Test server is not an AD server, so search filter is manually specified.
    searchFilterBySAN: '(uid=riemann)',
    cache: true,
    groupSearchFilter: '(member={{dn}})',
    groupSearchBase: 'dc=example,dc=com',
  })

  auth.on('error', error => {
    console.warn(error)
    // TODO: auth.close() doesn't do anything here
  })
})

afterEach(async () => {
  await auth.dispose()
})

describe('With valid credentials', () => {
  test('Can authenticate against test LDAP server', async () => {
    // Test server is not an AD server, so DN is specified in place of username so
    // that binding will work properly.
    const user = await auth.authenticate(
      'uid=riemann,dc=example,dc=com',
      'password'
    )
    expect(user).toMatchSnapshot()
  })

  test('Can re-authenticate against test LDAP server', async () => {
    const user1 = await auth.authenticate(
      'uid=riemann,dc=example,dc=com',
      'password'
    )
    expect(user1).toBeTruthy()
    const user2 = await auth.authenticate(
      'uid=riemann,dc=example,dc=com',
      'password'
    )
    expect(user2).toBeTruthy()
    expect(user1).toEqual(user2)
    expect(user1).toMatchSnapshot()
  })
})

describe('With invalid credentials', () => {
  test('Fails authentication', () => {
    return expect(
      auth.authenticate('INVALID_USERNAME', 'INVALID_CREDENTIALS')
    ).rejects.toMatchSnapshot()
  })
})
