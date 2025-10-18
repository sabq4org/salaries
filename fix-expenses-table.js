const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let connectionString = '';
for (const line of envLines) {
  if (line.startsWith('POSTGRES_URL=')) {
    connectionString = line.split('=')[1].replace(/"/g, '').trim();
    break;
  }
}

if (!connectionString) {
  throw new Error('POSTGRES_URL not found in .env.local');
}

async function fixExpensesTable() {
  const sql = postgres(connectionString);
  
  try {
    console.log('🔍 Checking expenses table structure...');
    
    // Check current structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'expenses'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Current expenses table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default || ''}`);
    });
    
    // Check if amount column exists
    const hasAmountColumn = columns.some(col => col.column_name === 'amount');
    
    if (!hasAmountColumn) {
      console.log('\n⚠️  Column "amount" is missing! Adding it now...');
      
      await sql`
        ALTER TABLE expenses 
        ADD COLUMN amount INTEGER NOT NULL DEFAULT 0
      `;
      
      console.log('✅ Column "amount" added successfully!');
      
      // Verify the change
      const updatedColumns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'expenses'
        ORDER BY ordinal_position
      `;
      
      console.log('\n📋 Updated expenses table structure:');
      updatedColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default || ''}`);
      });
    } else {
      console.log('\n✅ Column "amount" already exists!');
    }
    
    console.log('\n🎉 Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

fixExpensesTable()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });

