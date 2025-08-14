const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'data_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        serial_number VARCHAR(50) UNIQUE,
        sales_person VARCHAR(100),
        support_person VARCHAR(100),
        store_name VARCHAR(200) NOT NULL,
        customer_email VARCHAR(100),
        customer_phone VARCHAR(20),
        account_id VARCHAR(50),
        outlet_id VARCHAR(50),
        address_line TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        gstin VARCHAR(50),
        signup_date DATE,
        signup_pack VARCHAR(100),
        current_plan VARCHAR(100),
        validity_till DATE,
        next_renewal_on DATE,
        channel_partner VARCHAR(100),
        status VARCHAR(20) DEFAULT 'Active',
        category VARCHAR(100),
        product_name VARCHAR(200),
        paid_pack_amount DECIMAL(10,2),
        paid_sms_amount DECIMAL(10,2),
        paid_wa_amount DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
      CREATE INDEX IF NOT EXISTS idx_customers_signup_date ON customers(signup_date);
      CREATE INDEX IF NOT EXISTS idx_customers_category ON customers(category);
      CREATE INDEX IF NOT EXISTS idx_customers_next_renewal ON customers(next_renewal_on);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = { pool, initializeDatabase };