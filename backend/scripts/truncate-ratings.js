const mysql = require('mysql2/promise')
const fs = require('fs')
require('dotenv').config({ path: '.env' })

async function main() {
  const host = process.env.DB_HOST || 'localhost'
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306
  const user = process.env.DB_USERNAME || 'root'
  const password = process.env.DB_PASSWORD || ''
  const database = process.env.DB_DATABASE || 'store_rating_platform'

  console.log('Connecting to MySQL %s:%s database=%s', host, port, database)
  const conn = await mysql.createConnection({ host, port, user, password, database })
  try {
    console.log('Truncating table `ratings`...')
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;')
    await conn.query('TRUNCATE TABLE ratings;')
    await conn.query('SET FOREIGN_KEY_CHECKS = 1;')
    console.log('Truncate completed.')
  } catch (err) {
    console.error('Error during truncate:', err.message)
    process.exitCode = 2
  } finally {
    await conn.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
