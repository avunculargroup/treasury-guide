'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PdfItem {
  id: string;
  category: string;
  title: string;
  description: string | null;
  responsible: string | null;
  estimatedDays: number | null;
  status: string;
}

interface ChecklistPdfProps {
  title: string;
  items: PdfItem[];
  categories: Record<string, PdfItem[]>;
}

export function ChecklistPdf({ title, items, categories }: ChecklistPdfProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function generatePdf() {
    setIsGenerating(true);

    try {
      // Dynamic import to avoid SSR issues
      const { Document, Page, Text, View, StyleSheet, pdf } = await import(
        '@react-pdf/renderer'
      );

      const styles = StyleSheet.create({
        page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
        header: { marginBottom: 20 },
        title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
        subtitle: { fontSize: 10, color: '#627D98', marginBottom: 20 },
        disclaimer: {
          fontSize: 8,
          color: '#829AB1',
          marginBottom: 20,
          padding: 8,
          backgroundColor: '#F0F4F8',
          borderRadius: 4,
        },
        categoryTitle: {
          fontSize: 13,
          fontWeight: 'bold',
          marginTop: 16,
          marginBottom: 8,
          color: '#243B53',
        },
        item: {
          marginBottom: 8,
          padding: 8,
          backgroundColor: '#FAFBFC',
          borderRadius: 4,
        },
        itemTitle: { fontSize: 10, fontWeight: 'bold', color: '#334E68' },
        itemDescription: { fontSize: 9, color: '#627D98', marginTop: 2 },
        itemMeta: {
          fontSize: 8,
          color: '#829AB1',
          marginTop: 4,
          flexDirection: 'row' as const,
          gap: 12,
        },
        footer: {
          position: 'absolute' as const,
          bottom: 30,
          left: 40,
          right: 40,
          fontSize: 7,
          color: '#9FB3C8',
          textAlign: 'center' as const,
        },
      });

      const PdfDocument = () => (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>
                Generated {new Date().toLocaleDateString('en-AU')} | {items.length} tasks
              </Text>
            </View>

            <Text style={styles.disclaimer}>
              This checklist provides general educational information only and does not constitute
              financial, legal, or tax advice. Consult a qualified adviser for guidance specific to
              your circumstances.
            </Text>

            {Object.entries(categories).map(([category, catItems]) => (
              <View key={category}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {catItems.map((item) => (
                  <View key={item.id} style={styles.item}>
                    <Text style={styles.itemTitle}>☐ {item.title}</Text>
                    {item.description && (
                      <Text style={styles.itemDescription}>{item.description}</Text>
                    )}
                    <View style={styles.itemMeta}>
                      {item.responsible && <Text>Responsible: {item.responsible}</Text>}
                      {item.estimatedDays && <Text>Est: {item.estimatedDays} days</Text>}
                    </View>
                  </View>
                ))}
              </View>
            ))}

            <Text style={styles.footer}>
              Bitcoin Treasury Guide — This document is for educational purposes only.
            </Text>
          </Page>
        </Document>
      );

      const blob = await pdf(<PdfDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={generatePdf} disabled={isGenerating}>
      {isGenerating ? 'Generating PDF...' : 'Download PDF'}
    </Button>
  );
}
