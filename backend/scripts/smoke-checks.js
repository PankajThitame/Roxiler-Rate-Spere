const base = 'http://localhost:3000'

async function run() {
  try {
    console.log('1) Registering a test user')
    const regRes = await fetch(base + '/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Smoke Test User ABCDEFGHIJ', email: `smoke_${Date.now()}@test.com`, password: 'Password@123' }),
    })
    console.log(' register status:', regRes.status)

    console.log('2) Logging in as admin')
    const adminLogin = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@store.com', password: 'Admin@123' }),
    })
    const adminBody = await adminLogin.json()
    console.log(' admin login status:', adminLogin.status)
    const token = adminBody?.accessToken
    if (!token) {
      console.error('No admin token returned')
      process.exit(2)
    }

    console.log('3) Fetching /admin/stores with admin token')
    const storesRes = await fetch(base + '/admin/stores?page=1&size=5', { headers: { Authorization: `Bearer ${token}` } })
    const storesBody = await storesRes.json()
    console.log(' stores status:', storesRes.status, 'items:', (storesBody.items || []).length, 'total:', storesBody.total)

    console.log('Smoke checks completed')
  } catch (err) {
    console.error('Smoke checks failed:', err.message)
    process.exit(1)
  }
}

run()
