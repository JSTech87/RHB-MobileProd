import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface Document {
  id: string;
  type: 'passport' | 'visa';
  ownerName: string;
  documentNumber: string;
  issuingCountry: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired';
  imageUri?: string;
}

export const TravelDocumentsScreen: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Mock data
  const documents: Document[] = [
    {
      id: '1',
      type: 'passport',
      ownerName: 'Irvan Moses',
      documentNumber: 'A12345678',
      issuingCountry: 'United States',
      issueDate: '2018-05-20',
      expiryDate: '2028-05-20',
      status: 'valid',
    },
    {
      id: '2',
      type: 'passport',
      ownerName: 'Fatima Moses',
      documentNumber: 'B87654321',
      issuingCountry: 'United States',
      issueDate: '2018-03-15',
      expiryDate: '2028-03-15',
      status: 'valid',
    },
    {
      id: '3',
      type: 'passport',
      ownerName: 'Ahmed Moses',
      documentNumber: 'C11223344',
      issuingCountry: 'United States',
      issueDate: '2019-07-10',
      expiryDate: '2024-07-10',
      status: 'expiring',
    },
    {
      id: '4',
      type: 'visa',
      ownerName: 'Irvan Moses',
      documentNumber: 'V987654321',
      issuingCountry: 'Saudi Arabia',
      issueDate: '2023-01-15',
      expiryDate: '2024-12-31',
      status: 'valid',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return '#10B981';
      case 'expiring': return '#F59E0B';
      case 'expired': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'valid': return '#ECFDF5';
      case 'expiring': return '#FFFBEB';
      case 'expired': return '#FEF2F2';
      default: return '#F9FAFB';
    }
  };

  const handleAddDocument = () => {
    setShowAddModal(true);
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    Alert.alert(
      'Edit Document',
      `Edit ${document.type} for ${document.ownerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => console.log('Edit document') },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteDocument(document.id) },
      ]
    );
  };

  const handleDeleteDocument = (documentId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete document:', documentId) },
      ]
    );
  };

  const DocumentCard: React.FC<{ document: Document }> = ({ document }) => (
    <TouchableOpacity 
      style={styles.documentCard}
      onPress={() => handleEditDocument(document)}
    >
      <View style={styles.documentHeader}>
        <View style={styles.documentIcon}>
          <Ionicons 
            name={document.type === 'passport' ? 'book' : 'document-text'} 
            size={24} 
            color="#A83442" 
          />
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentType}>
            {document.type === 'passport' ? 'Passport' : 'Visa'}
          </Text>
          <Text style={styles.documentOwner}>{document.ownerName}</Text>
          <Text style={styles.documentNumber}>{document.documentNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(document.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(document.status) }]}>
            {document.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.documentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Issuing Country:</Text>
          <Text style={styles.detailValue}>{document.issuingCountry}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Issue Date:</Text>
          <Text style={styles.detailValue}>
            {new Date(document.issueDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Expiry Date:</Text>
          <Text style={[
            styles.detailValue,
            { color: document.status === 'expiring' ? '#F59E0B' : '#111827' }
          ]}>
            {new Date(document.expiryDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const AddDocumentModal: React.FC = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Document</Text>
          <TouchableOpacity>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Document Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity style={[styles.typeOption, styles.typeOptionSelected]}>
                <Ionicons name="book" size={24} color="#A83442" />
                <Text style={[styles.typeText, styles.typeTextSelected]}>Passport</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.typeOption}>
                <Ionicons name="document-text" size={24} color="#6B7280" />
                <Text style={styles.typeText}>Visa</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Document Details</Text>
            <Text style={styles.formNote}>
              Take a photo of your document or enter details manually
            </Text>
            
            <TouchableOpacity style={styles.photoButton}>
              <Ionicons name="camera" size={24} color="#A83442" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Travel Documents</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddDocument}>
          <Ionicons name="add" size={24} color="#A83442" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Document Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{documents.length}</Text>
              <Text style={styles.statLabel}>Total Documents</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
                {documents.filter(d => d.status === 'expiring').length}
              </Text>
              <Text style={styles.statLabel}>Expiring Soon</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#EF4444' }]}>
                {documents.filter(d => d.status === 'expired').length}
              </Text>
              <Text style={styles.statLabel}>Expired</Text>
            </View>
          </View>
        </View>

        {/* Documents List */}
        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>Your Documents</Text>
          <View style={styles.documentsList}>
            {documents.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Document Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={styles.tipText}>• Passports should be valid for at least 6 months</Text>
            <Text style={styles.tipText}>• Keep digital copies in secure cloud storage</Text>
            <Text style={styles.tipText}>• Check visa requirements for your destination</Text>
            <Text style={styles.tipText}>• Renew documents well before expiry dates</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <AddDocumentModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#A83442',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  documentsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  documentOwner: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  documentNumber: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  documentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A83442',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  typeOptionSelected: {
    borderColor: '#A83442',
    backgroundColor: '#FEF2F2',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeTextSelected: {
    color: '#A83442',
  },
  formNote: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    gap: 12,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A83442',
  },
}); 