const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

const query = (text, params) => pool.query(text, params);

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(150) UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS leads (
      id           SERIAL PRIMARY KEY,
      lead_name    VARCHAR(150) NOT NULL,
      company_name VARCHAR(150),
      email        VARCHAR(150),
      phone        VARCHAR(30),
      lead_source  VARCHAR(50),
      assigned_to  VARCHAR(100),
      status       VARCHAR(50) DEFAULT 'New',
      deal_value   NUMERIC(12,2) DEFAULT 0,
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      updated_at   TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notes (
      id         SERIAL PRIMARY KEY,
      lead_id    INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      content    TEXT NOT NULL,
      created_by VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON notes(lead_id);

    CREATE OR REPLACE FUNCTION update_leads_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS leads_updated_at_trigger ON leads;
    CREATE TRIGGER leads_updated_at_trigger
      BEFORE UPDATE ON leads
      FOR EACH ROW EXECUTE FUNCTION update_leads_updated_at();
  `);

  const { rows: userRows } = await pool.query(`SELECT id FROM users WHERE email = 'admin@example.com'`);
  if (userRows.length === 0) {
    const hashed = await bcrypt.hash('password123', 10);
    await pool.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`,
      ['Admin User', 'admin@example.com', hashed]
    );
    console.log('Seed user created: admin@example.com / password123');
  }

  const { rows: leadRows } = await pool.query(`SELECT id FROM leads LIMIT 1`);
  if (leadRows.length === 0) {
    await pool.query(`
      INSERT INTO leads (lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value) VALUES
      ('Nuwan Perera',      'Ceylon Tech Solutions',  'nuwan@ceylontech.lk',      '+94 77 123 4567', 'LinkedIn',   'Kasun Fernando',  'Contacted',     34000.00),
      ('Dilani Jayasinghe', 'Lanka Innovations',      'dilani@lankainno.lk',      '+94 71 234 5678', 'Website',    'Nimali Silva',    'Qualified',     87500.00),
      ('Chamara Bandara',   'Serendib Enterprises',   'chamara@serendib.lk',      '+94 76 345 6789', 'Referral',   'Kasun Fernando',  'Proposal Sent', 150000.00),
      ('Sachini Rodrigo',   'Colombo Digital Hub',    'sachini@colombodigi.lk',   '+94 70 456 7890', 'Cold Email', 'Nimali Silva',    'Won',           62000.00),
      ('Tharaka Wijeratne', 'SriTech Systems',        'tharaka@sritech.lk',       '+94 75 567 8901', 'Event',      'Kasun Fernando',  'Won',           110000.00),
      ('Malini Dissanayake','Pearl Software Ltd',     'malini@pearlsoft.lk',      '+94 72 678 9012', 'LinkedIn',   'Nimali Silva',    'Lost',          18000.00),
      ('Ruwan Karunaratne', 'Kandy Cloud Services',   'ruwan@kandycloud.lk',      '+94 78 789 0123', 'Website',    'Kasun Fernando',  'Lost',          9500.00),
      ('Pradeep Seneviratne','Galle IT Park',         'pradeep@galleit.lk',       '+94 74 890 1234', 'Referral',   'Nimali Silva',    'Contacted',     45000.00),
      ('Ishara Gunasekara', 'Negombo Ventures',       'ishara@negombov.lk',       '+94 77 901 2345', 'Other',      'Kasun Fernando',  'Won',           73000.00),
      ('Sanduni Wickramasinghe','Matara BizTech',     'sanduni@matarabiz.lk',     '+94 71 012 3456', 'Cold Email', 'Nimali Silva',    'Qualified',     56000.00)
    `);
    console.log('Seed leads inserted.');
  }

  console.log('Database initialized.');
}

module.exports = { query, initDb };
