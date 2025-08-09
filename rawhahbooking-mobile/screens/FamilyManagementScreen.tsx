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
  TextInput,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  dateOfBirth: string;
  passportStatus: 'valid' | 'expiring' | 'expired';
  passportNumber: string;
  passportExpiry: string;
  visaStatus: 'valid' | 'expiring' | 'expired' | 'none';
  visaExpiry?: string;
  specialNeeds?: string[];
  profileImage?: string;
  phone?: string;
  email?: string;
}

export const FamilyManagementScreen: React.FC<{ 
  onBack?: () => void;
  onAddMember?: () => void;
  familyMembers?: FamilyMember[];
}> = ({ onBack, onAddMember, familyMembers = [] }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEditMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    Alert.alert(
      'Remove Family Member',
      `Are you sure you want to remove ${memberName} from your family?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert('Member Removed', `${memberName} has been removed from your family.`);
          }
        },
      ]
    );
  };

  const handleChangeProfilePicture = (member: FamilyMember) => {
    Alert.alert(
      'Change Profile Picture',
      `Update profile picture for ${member.name}`,
      [
        { text: 'Take Photo', onPress: () => console.log('Take photo for', member.name) },
        { text: 'Choose from Gallery', onPress: () => console.log('Choose from gallery for', member.name) },
        { text: 'Remove Photo', style: 'destructive', onPress: () => console.log('Remove photo for', member.name) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleFamilySettings = () => {
    Alert.alert(
      'Family Settings',
      'Manage family preferences and settings',
      [
        { text: 'Family Preferences', onPress: () => console.log('Family preferences') },
        { text: 'Privacy Settings', onPress: () => console.log('Privacy settings') },
        { text: 'Emergency Contacts', onPress: () => console.log('Emergency contacts') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const filteredMembers = familyMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return '#10B981';
      case 'expiring': return '#F59E0B';
      case 'expired': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const maskPassportNumber = (passportNumber: string) => {
    if (!passportNumber || passportNumber.length < 4) return passportNumber;
    const lastFour = passportNumber.slice(-4);
    const masked = '•'.repeat(passportNumber.length - 4);
    return `${masked}${lastFour}`;
  };

  const StatusBadge: React.FC<{ status: string; expiry?: string }> = ({ status, expiry }) => {
    const getStatusConfig = () => {
      switch (status) {
        case 'valid':
          return { color: '#10B981', text: 'VALID', bgColor: '#ECFDF5' };
        case 'expiring':
          return { color: '#F59E0B', text: 'EXPIRING', bgColor: '#FFFBEB' };
        case 'expired':
          return { color: '#EF4444', text: 'EXPIRED', bgColor: '#FEF2F2' };
        case 'none':
          return { color: '#6B7280', text: 'N/A', bgColor: '#F9FAFB' };
        default:
          return { color: '#6B7280', text: 'UNKNOWN', bgColor: '#F9FAFB' };
      }
    };

    const config = getStatusConfig();

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.text}
        </Text>
        {expiry && status !== 'none' && (
          <Text style={[styles.expiryText, { color: config.color }]}>
            {expiry}
          </Text>
        )}
      </View>
    );
  };

  const FamilyMemberCard: React.FC<{ member: FamilyMember }> = ({ member }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <TouchableOpacity 
          style={styles.memberAvatarContainer}
          onPress={() => handleChangeProfilePicture(member)}
        >
          <View style={styles.memberAvatar}>
            <Text style={styles.memberInitials}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberDetails}>
            {member.relationship} • {member.age} years old
          </Text>
          <Text style={styles.memberBirth}>
            Born: {new Date(member.dateOfBirth).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.memberActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditMember(member)}
          >
            <Ionicons name="create-outline" size={20} color="#A83442" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteMember(member.id, member.name)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.documentStatus}>
        <View style={styles.statusRow}>
          <View style={styles.documentInfo}>
            <Text style={styles.statusLabel}>Passport:</Text>
            <Text style={styles.documentNumber}>{maskPassportNumber(member.passportNumber)}</Text>
          </View>
          <StatusBadge 
            status={member.passportStatus} 
            expiry={member.passportExpiry ? `Exp: ${new Date(member.passportExpiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : undefined}
          />
        </View>
        <View style={styles.statusRow}>
          <View style={styles.documentInfo}>
            <Text style={styles.statusLabel}>Visa:</Text>
            {member.visaStatus !== 'none' && (
              <Text style={styles.documentNumber}>••••••••</Text>
            )}
          </View>
          <StatusBadge 
            status={member.visaStatus} 
            expiry={member.visaExpiry ? `Exp: ${new Date(member.visaExpiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : undefined}
          />
        </View>
      </View>

      {member.specialNeeds && member.specialNeeds.length > 0 && (
        <View style={styles.specialNeeds}>
          <Text style={styles.specialNeedsLabel}>Special Requirements:</Text>
          <View style={styles.needsTags}>
            {member.specialNeeds.map((need, index) => (
              <View key={index} style={styles.needTag}>
                <Text style={styles.needTagText}>{need}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const EditMemberModal: React.FC = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Member</Text>
          <TouchableOpacity>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedMember && (
            <>
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Profile Picture</Text>
                <TouchableOpacity 
                  style={styles.profilePictureSection}
                  onPress={() => handleChangeProfilePicture(selectedMember)}
                >
                  <View style={styles.largeAvatar}>
                    <Text style={styles.largeInitials}>
                      {selectedMember.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.changePictureButton}>
                    <Ionicons name="camera" size={16} color="#A83442" />
                    <Text style={styles.changePictureText}>Change Picture</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={selectedMember.name}
                    placeholder="Enter full name"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Relationship</Text>
                  <TextInput
                    style={styles.textInput}
                    value={selectedMember.relationship}
                    placeholder="e.g., Spouse, Son, Daughter"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Date of Birth</Text>
                  <TextInput
                    style={styles.textInput}
                    value={selectedMember.dateOfBirth}
                    placeholder="MM/DD/YYYY"
                  />
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.textInput}
                    value={selectedMember.phone || ''}
                    placeholder="+1 (555) 123-4567"
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.textInput}
                    value={selectedMember.email || ''}
                    placeholder="email@example.com"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Travel Preferences</Text>
                <View style={styles.preferencesGrid}>
                  {['Halal meals', 'Aisle seat', 'Window seat', 'Extra legroom', 'Wheelchair assistance'].map((pref, index) => (
                    <TouchableOpacity key={index} style={styles.preferenceItem}>
                      <View style={styles.checkbox}>
                        {selectedMember.specialNeeds?.includes(pref) && (
                          <Ionicons name="checkmark" size={16} color="#A83442" />
                        )}
                      </View>
                      <Text style={styles.preferenceText}>{pref}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Management</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleFamilySettings}>
          <Ionicons name="settings-outline" size={24} color="#A83442" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Family Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.familyIcon}>
              <MaterialIcons name="family-restroom" size={32} color="#A83442" />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.familyName}>Ahmed's Family</Text>
              <Text style={styles.familyStats}>
                {familyMembers.length + 1} members • {familyMembers.filter(m => m.age >= 18).length + 1} adults • {familyMembers.filter(m => m.age < 18).length} children
              </Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.primaryButton} onPress={onAddMember}>
              <Ionicons name="person-add" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Add Member</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleFamilySettings}>
              <Ionicons name="settings" size={20} color="#A83442" />
              <Text style={styles.secondaryButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search family members..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Family Members List */}
        <View style={styles.membersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Family Members ({filteredMembers.length})</Text>
            <TouchableOpacity onPress={() => Alert.alert('Sort Options', 'Choose sorting preference')}>
              <Ionicons name="funnel-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {filteredMembers.length > 0 ? (
            <View style={styles.membersList}>
              {filteredMembers.map((member) => (
                <FamilyMemberCard key={member.id} member={member} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>
                {searchQuery ? 'No members found' : 'No family members yet'}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Add family members to start managing your family travel'
                }
              </Text>
              {!searchQuery && (
                <TouchableOpacity style={styles.addFirstMemberButton} onPress={onAddMember}>
                  <Text style={styles.addFirstMemberText}>Add First Member</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Family Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Family Management Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={styles.tipText}>• Keep all family documents up to date</Text>
            <Text style={styles.tipText}>• Add emergency contacts for each member</Text>
            <Text style={styles.tipText}>• Set travel preferences for smoother bookings</Text>
            <Text style={styles.tipText}>• Regularly review and update member information</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <EditMemberModal />
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
  settingsButton: {
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
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  familyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  summaryInfo: {
    flex: 1,
  },
  familyName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  familyStats: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A83442',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A83442',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  membersSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  membersList: {
    gap: 16,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitials: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  memberDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  memberBirth: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentStatus: {
    gap: 8,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  documentInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  documentNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expiryText: {
    fontSize: 10,
    marginTop: 2,
    opacity: 0.8,
  },
  specialNeeds: {
    marginTop: 8,
  },
  specialNeedsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  needsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  needTag: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  needTagText: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstMemberButton: {
    backgroundColor: '#A83442',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstMemberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  largeInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changePictureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  changePictureText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A83442',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  preferencesGrid: {
    gap: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceText: {
    fontSize: 14,
    color: '#374151',
  },
}); 