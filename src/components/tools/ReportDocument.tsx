import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { ReportData } from '@/lib/lims/report';

type Labels = Dictionary['tools']['informe']['pdf'];

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: 'Helvetica', color: '#15171a' },
  banner: { backgroundColor: '#fef3c7', color: '#92400e', padding: 6, marginBottom: 10, fontSize: 8, textAlign: 'center' },
  h1: { fontSize: 15, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  sub: { color: '#55595f', marginBottom: 12 },
  h2: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 12, marginBottom: 4 },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#bdbbb2', paddingVertical: 3 },
  head: { fontFamily: 'Helvetica-Bold' },
  cell: { flex: 1, paddingRight: 4 },
  wide: { flex: 2, paddingRight: 4 },
  mono: { fontFamily: 'Courier', fontSize: 7 },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, fontSize: 7, color: '#55595f', textAlign: 'center' },
});

export function ReportDocument({ data, labels, matrixLabel }: { data: ReportData; labels: Labels; matrixLabel: string }) {
  return (
    <Document title={`${labels.heading} ${data.sampleId}`} author="Andrés Nahuel Páez">
      <Page size="A4" style={styles.page}>
        <Text style={styles.banner}>{labels.demo}</Text>
        <Text style={styles.h1}>Andrés Nahuel Páez · Portfolio · {labels.heading}</Text>
        <Text style={styles.sub}>
          {labels.sample}: {data.sampleId} ({labels.revision} {data.revision}) · {labels.patient}: {data.patientName} ({data.patientId}) ·{' '}
          {labels.matrix}: {matrixLabel} · {labels.received}: {data.receivedAt.replace('T', ' ')} UTC
        </Text>

        <View style={[styles.row, styles.head]}>
          <Text style={styles.cell}>{labels.test}</Text>
          <Text style={styles.cell}>{labels.loinc}</Text>
          <Text style={styles.cell}>{labels.value}</Text>
          <Text style={styles.cell}>{labels.units}</Text>
          <Text style={styles.cell}>{labels.range}</Text>
          <Text style={styles.cell}>{labels.flag}</Text>
          <Text style={styles.wide}>{labels.qc}</Text>
        </View>
        {data.results.map((r) => (
          <View key={r.testCode} style={styles.row}>
            <Text style={styles.cell}>{r.testCode}</Text>
            <Text style={styles.cell}>{r.loinc ?? '—'}</Text>
            <Text style={styles.cell}>{r.rawValue}</Text>
            <Text style={styles.cell}>{r.units}</Text>
            <Text style={styles.cell}>{r.referenceRange}</Text>
            <Text style={styles.cell}>{r.flag}</Text>
            <Text style={styles.wide}>
              {r.runId || labels.noQc}
              {r.runStatus ? ` · ${labels.runStatus[r.runStatus]}` : ''}
            </Text>
          </View>
        ))}

        <Text style={styles.h2}>{labels.signatures}</Text>
        {data.signatures.map((g) => (
          <Text key={`${g.meaning}-${g.userId}`}>
            {labels.meaning[g.meaning]} · {g.userName} ({labels.roles[g.role]}) · {g.at.replace('T', ' ')} UTC
          </Text>
        ))}

        <Text style={styles.h2}>{labels.recordHash}</Text>
        <Text style={styles.mono}>{data.recordHash}</Text>
        <Text style={styles.h2}>{labels.auditHead}</Text>
        <Text style={styles.mono}>{data.auditHead}</Text>

        <Text style={styles.footer} fixed>
          {labels.generated}: {data.generatedAt.replace('T', ' ')} UTC · {labels.author}
        </Text>
      </Page>
    </Document>
  );
}
