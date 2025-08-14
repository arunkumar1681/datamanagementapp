const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const { getPool, initializeDatabase, poolReady } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${d.getDate().toString().padStart(2, '0')} - ${months[d.getMonth()]} - ${d.getFullYear()}`;
};

// Helper function to format time
const formatTime = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};

// Map snake_case DB row to camelCase expected by frontend
const mapCustomerRowToCamelCase = (row) => ({
  serialNumber: row.serial_number,
  salesPerson: row.sales_person,
  supportPerson: row.support_person,
  storeName: row.store_name,
  customerEmail: row.customer_email,
  customerPhone: row.customer_phone,
  accountId: row.account_id,
  outletId: row.outlet_id,
  addressLine: row.address_line,
  city: row.city,
  state: row.state,
  country: row.country,
  gstin: row.gstin,
  signupDate: formatDate(row.signup_date),
  signupPack: row.signup_pack,
  currentPlan: row.current_plan,
  validityTill: formatDate(row.validity_till),
  nextRenewalOn: formatDate(row.next_renewal_on),
  channelPartner: row.channel_partner,
  status: row.status,
  category: row.category,
  productName: row.product_name,
  paidPackAmount: row.paid_pack_amount,
  paidSmsAmount: row.paid_sms_amount,
  paidWaAmount: row.paid_wa_amount,
  createdAt: formatTime(row.created_at)
});

// Generate unique serial number
const generateSerialNumber = async () => {
  await poolReady;
  const result = await getPool().query('SELECT COUNT(*) FROM customers');
  const count = parseInt(result.rows[0].count) + 1;
  return `CUS${count.toString().padStart(6, '0')}`;
};

// Routes

// Get all customers with pagination and filtering
app.get('/api/customers', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM customers WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM customers WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Add filters
    if (status && status !== 'all') {
      query += ` AND status = $${paramIndex}`;
      countQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category && category !== 'all') {
      query += ` AND category = $${paramIndex}`;
      countQuery += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (store_name ILIKE $${paramIndex} OR customer_email ILIKE $${paramIndex} OR account_id ILIKE $${paramIndex})`;
      countQuery += ` AND (store_name ILIKE $${paramIndex} OR customer_email ILIKE $${paramIndex} OR account_id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND signup_date >= $${paramIndex}`;
      countQuery += ` AND signup_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND signup_date <= $${paramIndex}`;
      countQuery += ` AND signup_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [customers, totalCount] = await Promise.all([
      getPool().query(query, params),
      getPool().query(countQuery, params.slice(0, -2))
    ]);

    const formattedCustomers = customers.rows.map(mapCustomerRowToCamelCase);

    res.json({
      customers: formattedCustomers,
      totalCount: parseInt(totalCount.rows[0].count),
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer by ID or serial number
app.get('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let result;

    if (/^\d+$/.test(id)) {
      // If numeric, try by numeric id or by serial_number equal to same string
      result = await getPool().query('SELECT * FROM customers WHERE id = $1 OR serial_number = $2', [parseInt(id, 10), id]);
    } else {
      // Otherwise, treat as serial number
      result = await getPool().query('SELECT * FROM customers WHERE serial_number = $1', [id]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const formattedCustomer = mapCustomerRowToCamelCase(result.rows[0]);

    res.json(formattedCustomer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new customer
app.post('/api/customers', async (req, res) => {
  try {
    const serialNumber = await generateSerialNumber();
    const customerData = { ...req.body, serial_number: serialNumber };

    const query = `
      INSERT INTO customers (
        serial_number, sales_person, support_person, store_name, customer_email,
        customer_phone, account_id, outlet_id, address_line, city, state, country,
        gstin, signup_date, signup_pack, current_plan, validity_till, next_renewal_on,
        channel_partner, status, category, product_name, paid_pack_amount,
        paid_sms_amount, paid_wa_amount
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      ) RETURNING *
    `;

    const values = [
      customerData.serial_number, customerData.sales_person, customerData.support_person,
      customerData.store_name, customerData.customer_email, customerData.customer_phone,
      customerData.account_id, customerData.outlet_id, customerData.address_line,
      customerData.city, customerData.state, customerData.country, customerData.gstin,
      customerData.signup_date, customerData.signup_pack, customerData.current_plan,
      customerData.validity_till, customerData.next_renewal_on, customerData.channel_partner,
      customerData.status || 'Active', customerData.category, customerData.product_name,
      customerData.paid_pack_amount, customerData.paid_sms_amount, customerData.paid_wa_amount
    ];

    const result = await getPool().query(query, values);
    res.status(201).json(mapCustomerRowToCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer
app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customerData = req.body;

    const query = `
      UPDATE customers SET
        sales_person = $2, support_person = $3, store_name = $4, customer_email = $5,
        customer_phone = $6, account_id = $7, outlet_id = $8, address_line = $9,
        city = $10, state = $11, country = $12, gstin = $13, signup_date = $14,
        signup_pack = $15, current_plan = $16, validity_till = $17, next_renewal_on = $18,
        channel_partner = $19, status = $20, category = $21, product_name = $22,
        paid_pack_amount = $23, paid_sms_amount = $24, paid_wa_amount = $25,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `;

    const values = [
      id, customerData.sales_person, customerData.support_person, customerData.store_name,
      customerData.customer_email, customerData.customer_phone, customerData.account_id,
      customerData.outlet_id, customerData.address_line, customerData.city, customerData.state,
      customerData.country, customerData.gstin, customerData.signup_date, customerData.signup_pack,
      customerData.current_plan, customerData.validity_till, customerData.next_renewal_on,
      customerData.channel_partner, customerData.status, customerData.category,
      customerData.product_name, customerData.paid_pack_amount, customerData.paid_sms_amount,
      customerData.paid_wa_amount
    ];

    const result = await getPool().query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(mapCustomerRowToCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete customer
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getPool().query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const [
      activeCustomers,
      inactiveCustomers,
      lastMonthChurn,
      lastMonthNewSales,
      lastMonthUpsells,
      lastMonthNegativeChurn
    ] = await Promise.all([
      getPool().query("SELECT COUNT(*) FROM customers WHERE status = 'Active'"),
      getPool().query("SELECT COUNT(*) FROM customers WHERE status = 'Inactive'"),
      getPool().query("SELECT COUNT(*) FROM customers WHERE status = 'Inactive' AND updated_at >= $1 AND updated_at < $2", [lastMonth, thisMonth]),
      getPool().query("SELECT COUNT(*) FROM customers WHERE created_at >= $1 AND created_at < $2", [lastMonth, thisMonth]),
      getPool().query("SELECT COUNT(*) FROM customers WHERE updated_at >= $1 AND updated_at < $2 AND (paid_pack_amount > 0 OR paid_sms_amount > 0 OR paid_wa_amount > 0)", [lastMonth, thisMonth]),
      getPool().query("SELECT COUNT(*) FROM customers WHERE status = 'Active' AND updated_at >= $1 AND updated_at < $2", [lastMonth, thisMonth])
    ]);

    res.json({
      activeCustomers: parseInt(activeCustomers.rows[0].count),
      inactiveCustomers: parseInt(inactiveCustomers.rows[0].count),
      churnLastMonth: parseInt(lastMonthChurn.rows[0].count),
      newSalesLastMonth: parseInt(lastMonthNewSales.rows[0].count),
      newUpsellsLastMonth: parseInt(lastMonthUpsells.rows[0].count),
      negativeChurnLastMonth: parseInt(lastMonthNegativeChurn.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Excel import
app.post('/api/import/excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let imported = 0;
    let errors = [];

    for (const row of data) {
      try {
        const serialNumber = await generateSerialNumber();
        const customerData = {
          serial_number: serialNumber,
          sales_person: row['Sales Person'] || '',
          support_person: row['Support Person'] || '',
          store_name: row['Store Name'] || '',
          customer_email: row['Customer Email'] || '',
          customer_phone: row['Customer Phone'] || '',
          account_id: row['Account ID'] || '',
          outlet_id: row['Outlet ID'] || '',
          address_line: row['Address Line'] || '',
          city: row['City'] || '',
          state: row['State'] || '',
          country: row['Country'] || '',
          gstin: row['GSTIN'] || '',
          signup_date: row['Signup Date'] ? new Date(row['Signup Date']) : null,
          signup_pack: row['Signup Pack'] || '',
          current_plan: row['Current Plan'] || '',
          validity_till: row['Validity Till'] ? new Date(row['Validity Till']) : null,
          next_renewal_on: row['Next Renewal On'] ? new Date(row['Next Renewal On']) : null,
          channel_partner: row['Channel Partner'] || '',
          status: row['Status'] || 'Active',
          category: row['Category'] || '',
          product_name: row['Product Name'] || '',
          paid_pack_amount: parseFloat(row['Paid Pack Amount']) || 0,
          paid_sms_amount: parseFloat(row['Paid SMS Amount']) || 0,
          paid_wa_amount: parseFloat(row['Paid WA Amount']) || 0
        };

        const query = `
          INSERT INTO customers (
            serial_number, sales_person, support_person, store_name, customer_email,
            customer_phone, account_id, outlet_id, address_line, city, state, country,
            gstin, signup_date, signup_pack, current_plan, validity_till, next_renewal_on,
            channel_partner, status, category, product_name, paid_pack_amount,
            paid_sms_amount, paid_wa_amount
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
          )
        `;

        const values = [
          customerData.serial_number, customerData.sales_person, customerData.support_person,
          customerData.store_name, customerData.customer_email, customerData.customer_phone,
          customerData.account_id, customerData.outlet_id, customerData.address_line,
          customerData.city, customerData.state, customerData.country, customerData.gstin,
          customerData.signup_date, customerData.signup_pack, customerData.current_plan,
          customerData.validity_till, customerData.next_renewal_on, customerData.channel_partner,
          customerData.status, customerData.category, customerData.product_name,
          customerData.paid_pack_amount, customerData.paid_sms_amount, customerData.paid_wa_amount
        ];

        await getPool().query(query, values);
        imported++;
      } catch (error) {
        errors.push(`Row ${imported + errors.length + 1}: ${error.message}`);
      }
    }

    res.json({
      message: `Import completed. ${imported} records imported successfully.`,
      imported,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    console.error('Error importing Excel file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Excel export
app.get('/api/export/excel', async (req, res) => {
  try {
    const result = await getPool().query('SELECT * FROM customers ORDER BY created_at DESC');
    const customers = result.rows.map((customer) => ({
      'Serial Number': customer.serial_number,
      'Sales Person': customer.sales_person,
      'Support Person': customer.support_person,
      'Store Name': customer.store_name,
      'Customer Email': customer.customer_email,
      'Customer Phone': customer.customer_phone,
      'Account ID': customer.account_id,
      'Outlet ID': customer.outlet_id,
      'Address Line': customer.address_line,
      'City': customer.city,
      'State': customer.state,
      'Country': customer.country,
      'GSTIN': customer.gstin,
      'Signup Date': formatDate(customer.signup_date),
      'Signup Pack': customer.signup_pack,
      'Current Plan': customer.current_plan,
      'Validity Till': formatDate(customer.validity_till),
      'Next Renewal On': formatDate(customer.next_renewal_on),
      'Channel Partner': customer.channel_partner,
      'Status': customer.status,
      'Category': customer.category,
      'Product Name': customer.product_name,
      'Paid Pack Amount': customer.paid_pack_amount,
      'Paid SMS Amount': customer.paid_sms_amount,
      'Paid WA Amount': customer.paid_wa_amount,
      'Created At': formatTime(customer.created_at)
    }));

    const worksheet = xlsx.utils.json_to_sheet(customers);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Customers');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=customers.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting Excel file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server only after DB is initialized
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});