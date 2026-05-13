import { Injectable, Logger } from '@nestjs/common';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 15,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    padding: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 120,
    fontSize: 11,
    color: '#64748b',
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    fontSize: 11,
    color: '#334155',
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  dimensionBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 8,
  },
  dimensionLabel: {
    fontSize: 11,
    color: '#334155',
    fontWeight: 'bold',
  },
  dimensionScore: {
    fontSize: 11,
    color: '#4f46e5',
    fontWeight: 'bold',
  },
  recommendationBadge: {
    padding: '6 12',
    borderRadius: 16,
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportBlockTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 10,
    marginBottom: 5,
  },
  reportBlockContent: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  dimensionSummary: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 15,
    fontSize: 11,
    color: '#475569',
  },
  listItemText: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
    lineHeight: 1.4,
  },
  alertWarning: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#b45309',
    marginBottom: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
});

const ReportPDF = ({ data }: { data: any }) => {
  const { candidate, session, jobPosition, score, report } = data;
  
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'recommended': return { color: '#059669', bg: '#d1fae5', text: 'Recomendado' };
      case 'review': return { color: '#d97706', bg: '#fef3c7', text: 'En Revisión' };
      case 'not_recommended': return { color: '#dc2626', bg: '#fee2e2', text: 'No Recomendado' };
      default: return { color: '#64748b', bg: '#f1f5f9', text: 'Pendiente' };
    }
  };

  const recStyle = score ? getRecommendationColor(score.recommendation) : getRecommendationColor('');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>ANDREA IA</Text>
            <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Reporte de Evaluación Psicotécnica</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, color: '#64748b' }}>Fecha: {new Date(session.completedAt || session.createdAt).toLocaleDateString('es-AR')}</Text>
            <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>ID: {session.id.substring(0, 8)}</Text>
          </View>
        </View>

        {/* Info del Candidato */}
        <View style={styles.section}>
          <Text style={styles.title}>{candidate.firstName} {candidate.lastName}</Text>
          <Text style={styles.subtitle}>Postulante para: {jobPosition.name}</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{candidate.email}</Text>
          </View>
          {candidate.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{candidate.phone}</Text>
            </View>
          )}
          {candidate.resumeUrl && (
            <View style={styles.row}>
              <Text style={styles.label}>CV Procesado:</Text>
              <Text style={styles.value}>Sí</Text>
            </View>
          )}
        </View>

        {/* Score y Recomendación */}
        {score && (
          <>
            <View style={styles.scoreBox}>
              <View>
                <Text style={styles.scoreLabel}>Score Global</Text>
                <Text style={styles.scoreValue}>{Math.round(score.globalScore)}<Text style={{ fontSize: 14, color: '#94a3b8' }}>/100</Text></Text>
              </View>
              <View style={{ ...styles.recommendationBadge, backgroundColor: recStyle.bg }}>
                <Text style={{ color: recStyle.color }}>{recStyle.text}</Text>
              </View>
            </View>

            {/* Resumen Ejecutivo */}
            {report && report.executiveSummary && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
                <Text style={styles.reportBlockContent}>{report.executiveSummary}</Text>
              </View>
            )}

            {/* Fortalezas y Riesgos */}
            {((score.strengths && Array.isArray(score.strengths) && score.strengths.length > 0) || 
              (score.riskFlags && Array.isArray(score.riskFlags) && score.riskFlags.length > 0)) && (
              <View style={styles.section}>
                {score.strengths && Array.isArray(score.strengths) && score.strengths.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ ...styles.sectionTitle, borderLeftColor: '#10b981' }}>Fortalezas Principales</Text>
                    {score.strengths.map((str: string, idx: number) => (
                      <View key={idx} style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.listItemText}>{str}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {score.riskFlags && Array.isArray(score.riskFlags) && score.riskFlags.length > 0 && (
                  <View style={styles.alertWarning}>
                    <Text style={styles.alertTitle}>Indicadores a Revisar</Text>
                    {score.riskFlags.map((flag: string, idx: number) => (
                      <View key={idx} style={styles.listItem}>
                        <Text style={{ ...styles.bullet, color: '#b45309' }}>•</Text>
                        <Text style={{ ...styles.listItemText, color: '#b45309' }}>{flag.replace(/_/g, ' ')}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Desglose por Dimensión</Text>
              
              <View style={styles.dimensionBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dimensionLabel}>Cognitiva</Text>
                  {score.dimensionDetails?.cognitive?.summary && (
                    <Text style={styles.dimensionSummary}>{score.dimensionDetails.cognitive.summary}</Text>
                  )}
                </View>
                <Text style={styles.dimensionScore}>{Math.round(score.cognitiveScore)} / 100</Text>
              </View>
              
              <View style={styles.dimensionBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dimensionLabel}>Conductual</Text>
                  {score.dimensionDetails?.behavioral?.summary && (
                    <Text style={styles.dimensionSummary}>{score.dimensionDetails.behavioral.summary}</Text>
                  )}
                </View>
                <Text style={styles.dimensionScore}>{Math.round(score.behavioralScore)} / 100</Text>
              </View>
              
              <View style={styles.dimensionBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dimensionLabel}>Comunicación</Text>
                  {score.dimensionDetails?.communication?.summary && (
                    <Text style={styles.dimensionSummary}>{score.dimensionDetails.communication.summary}</Text>
                  )}
                </View>
                <Text style={styles.dimensionScore}>{Math.round(score.communicationScore)} / 100</Text>
              </View>
              
              <View style={styles.dimensionBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dimensionLabel}>Consistencia</Text>
                  {score.dimensionDetails?.consistency?.summary && (
                    <Text style={styles.dimensionSummary}>{score.dimensionDetails.consistency.summary}</Text>
                  )}
                </View>
                <Text style={styles.dimensionScore}>{Math.round(score.consistencyScore)} / 100</Text>
              </View>
            </View>
          </>
        )}

        {/* Footer */}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `Reporte confidencial generado automáticamente por ANDREA IA - Página ${pageNumber} de ${totalPages}`
        )} />
      </Page>
    </Document>
  );
};

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generateCandidateReport(data: any): Promise<NodeJS.ReadableStream> {
    this.logger.log(`Generating PDF report for candidate ${data.candidate.id}`);
    
    const stream = await renderToStream(<ReportPDF data={data} />);
    return stream;
  }
}
