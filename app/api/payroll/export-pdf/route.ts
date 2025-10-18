import { NextRequest, NextResponse } from 'next/server';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';

// Register Arabic font
Font.register({
  family: 'Cairo',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hGA-W1ToLQ-HmkA.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hL8-W1ToLQ-HmkA.ttf',
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Cairo',
    direction: 'rtl',
  },
  header: {
    backgroundColor: '#2980b9',
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'right',
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#3498db',
    paddingVertical: 10,
    marginBottom: 5,
  },
  tableHeaderContractor: {
    backgroundColor: '#2ecc71',
  },
  tableCell: {
    fontSize: 10,
    textAlign: 'center',
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    padding: 5,
  },
  col1: { width: '5%' },
  col2: { width: '20%' },
  col3: { width: '15%' },
  col4: { width: '12%' },
  col5: { width: '12%' },
  col6: { width: '12%' },
  col7: { width: '12%' },
  col8: { width: '12%' },
  summaryBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 12,
  },
  signatureBox: {
    marginTop: 30,
    textAlign: 'right',
  },
  signatureLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    color: '#888',
  },
});

const months = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

interface PayrollPDFProps {
  data: any;
}

const PayrollPDF = ({ data }: PayrollPDFProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          مسير رواتب {months[data.month - 1]} {data.year}
        </Text>
        <Text style={styles.headerSubtitle}>صحيفة سبق الإلكترونية</Text>
      </View>

      {/* Employee Payrolls */}
      {data.employeePayrolls && data.employeePayrolls.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>الموظفون الرسميون</Text>
          <View style={styles.table}>
            <View style={[styles.tableHeader]}>
              <Text style={[styles.tableCellHeader, styles.col1]}>م</Text>
              <Text style={[styles.tableCellHeader, styles.col2]}>الاسم</Text>
              <Text style={[styles.tableCellHeader, styles.col3]}>المنصب</Text>
              <Text style={[styles.tableCellHeader, styles.col4]}>الراتب الأساسي</Text>
              <Text style={[styles.tableCellHeader, styles.col5]}>التأمينات</Text>
              <Text style={[styles.tableCellHeader, styles.col6]}>الخصومات</Text>
              <Text style={[styles.tableCellHeader, styles.col7]}>البدلات</Text>
              <Text style={[styles.tableCellHeader, styles.col8]}>صافي الراتب</Text>
            </View>
            {data.employeePayrolls.map((emp: any, index: number) => (
              <View key={emp.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{emp.employeeName || ''}</Text>
                <Text style={[styles.tableCell, styles.col3]}>{emp.position || '-'}</Text>
                <Text style={[styles.tableCell, styles.col4]}>{emp.baseSalary.toLocaleString('ar-SA')}</Text>
                <Text style={[styles.tableCell, styles.col5]}>{emp.socialInsurance.toLocaleString('ar-SA')}</Text>
                <Text style={[styles.tableCell, styles.col6]}>{emp.deduction.toLocaleString('ar-SA')}</Text>
                <Text style={[styles.tableCell, styles.col7]}>{emp.bonus.toLocaleString('ar-SA')}</Text>
                <Text style={[styles.tableCell, styles.col8]}>{emp.netSalary.toLocaleString('ar-SA')}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Contractor Payrolls */}
      {data.contractorPayrolls && data.contractorPayrolls.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>المتعاونون</Text>
          <View style={styles.table}>
            <View style={[styles.tableHeader, styles.tableHeaderContractor]}>
              <Text style={[styles.tableCellHeader, styles.col1]}>م</Text>
              <Text style={[styles.tableCellHeader, styles.col2]}>الاسم</Text>
              <Text style={[styles.tableCellHeader, styles.col3]}>المنصب</Text>
              <Text style={[styles.tableCellHeader, styles.col4]}>الراتب</Text>
              <Text style={[styles.tableCellHeader, styles.col6]}>الخصومات</Text>
              <Text style={[styles.tableCellHeader, styles.col7]}>البدلات</Text>
              <Text style={[styles.tableCellHeader, styles.col8]}>صافي

 الراتب</Text>
            </View>
            {data.contractorPayrolls.map((con: any, index: number) => (
              <View key={con.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{con.contractorName || ''}</Text>
                <Text style={[styles.tableCell, styles.col3]}>{con.position || '-'}</Text>
                <Text style={[styles.tableCell, styles.col4]}>{con.salary.toLocaleString('ar-SA')}</Text>
                <Text style={[styles.tableCell, styles.col6]}>{con.deduction.toLocaleString('ar-SA')}</Text>
                <Text style={[styles.tableCell, styles.col7]}>{con.bonus.toLocaleString('ar-SA')}</Text>
                <Text style={[styles.tableCell, styles.col8]}>{con.netSalary.toLocaleString('ar-SA')}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>الملخص المالي</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>إجمالي رواتب الموظفين الرسميين</Text>
          <Text style={styles.summaryValue}>{data.totalEmployeeSalaries.toLocaleString('ar-SA')} ر.س</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>إجمالي رواتب المتعاونين</Text>
          <Text style={styles.summaryValue}>{data.totalContractorSalaries.toLocaleString('ar-SA')} ر.س</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>إجمالي التأمينات ال

اجتماعية</Text>
          <Text style={styles.summaryValue}>{data.totalSocialInsurance.toLocaleString('ar-SA')} ر.س</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>الإجمالي الكلي</Text>
          <Text style={styles.summaryValue}>{data.grandTotal.toLocaleString('ar-SA')} ر.س</Text>
        </View>
      </View>

      {/* Signature */}
      <View style={styles.signatureBox}>
        <Text style={styles.signatureLabel}>المدير العام</Text>
        <Text style={styles.signatureName}>علي بن عبده الحازمي</Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}
      </Text>
    </Page>
  </Document>
);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const pdfDoc = <PayrollPDF data={data} />;
    const asPdf = pdf();
    asPdf.updateContainer(pdfDoc);
    const blob = await asPdf.toBlob();
    
    const buffer = await blob.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="مسير_رواتب_${months[data.month - 1]}_${data.year}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

