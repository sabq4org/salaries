const postgres = require('postgres');

const connectionString = "postgresql://postgres:wETzd0ChImYmmUB1@db.fhijotuxhsigcbadknzq.supabase.co:5432/postgres";

console.log('🔄 جاري الاتصال بقاعدة البيانات...');
console.log('URL:', connectionString.substring(0, 50) + '...');

const sql = postgres(connectionString, { prepare: false });

sql`SELECT COUNT(*) FROM employees`
  .then(result => {
    console.log('✅ عدد الموظفين:', result[0].count);
    return sql`SELECT * FROM employees LIMIT 3`;
  })
  .then(employees => {
    console.log('✅ الموظفون:');
    employees.forEach(emp => {
      console.log(`  - ${emp.name} (${emp.position}): ${emp.baseSalary} ريال`);
    });
    sql.end();
  })
  .catch(error => {
    console.error('❌ خطأ:', error.message);
    console.error('التفاصيل:', error);
    sql.end();
    process.exit(1);
  });

