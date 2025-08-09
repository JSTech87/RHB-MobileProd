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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface Region {
  code: string;
  name: string;
  currency: string;
  flag: string;
}

export const LanguageRegionScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const languages: Language[] = [
    { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt-PT', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
    { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ];

  const regions: Region[] = [
    { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
    { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', flag: '🇸🇦' },
    { code: 'AE', name: 'United Arab Emirates', currency: 'AED', flag: '🇦🇪' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
    { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
    { code: 'DE', name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
    { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
    { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳' },
    { code: 'MY', name: 'Malaysia', currency: 'MYR', flag: '🇲🇾' },
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  ];

  const handleLanguageSelect = (languageCode: string) => {
    Alert.alert(
      'Change Language',
      `Switch to ${languages.find(l => l.code === languageCode)?.name}? The app will restart to apply changes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Change', 
          onPress: () => {
            setSelectedLanguage(languageCode);
            // In production, this would trigger app restart and language change
            Alert.alert('Language Changed', 'Language will be applied on next app restart.');
          }
        },
      ]
    );
  };

  const handleRegionSelect = (regionCode: string) => {
    const region = regions.find(r => r.code === regionCode);
    if (region) {
      setSelectedRegion(regionCode);
      setSelectedCurrency(region.currency);
      Alert.alert('Region Changed', `Region set to ${region.name}. Currency updated to ${region.currency}.`);
    }
  };

  const handleCurrencySelect = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    const currency = currencies.find(c => c.code === currencyCode);
    Alert.alert('Currency Changed', `Currency set to ${currency?.name} (${currency?.symbol}).`);
  };

  const LanguageItem: React.FC<{ language: Language }> = ({ language }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={() => handleLanguageSelect(language.code)}
    >
      <View style={styles.itemLeft}>
        <Text style={styles.flag}>{language.flag}</Text>
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{language.name}</Text>
          <Text style={styles.itemSubtitle}>{language.nativeName}</Text>
        </View>
      </View>
      {selectedLanguage === language.code && (
        <Ionicons name="checkmark" size={20} color="#10B981" />
      )}
    </TouchableOpacity>
  );

  const RegionItem: React.FC<{ region: Region }> = ({ region }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={() => handleRegionSelect(region.code)}
    >
      <View style={styles.itemLeft}>
        <Text style={styles.flag}>{region.flag}</Text>
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{region.name}</Text>
          <Text style={styles.itemSubtitle}>Currency: {region.currency}</Text>
        </View>
      </View>
      {selectedRegion === region.code && (
        <Ionicons name="checkmark" size={20} color="#10B981" />
      )}
    </TouchableOpacity>
  );

  const CurrencyItem: React.FC<{ currency: any }> = ({ currency }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={() => handleCurrencySelect(currency.code)}
    >
      <View style={styles.itemLeft}>
        <View style={styles.currencySymbol}>
          <Text style={styles.currencySymbolText}>{currency.symbol}</Text>
        </View>
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{currency.name}</Text>
          <Text style={styles.itemSubtitle}>{currency.code}</Text>
        </View>
      </View>
      {selectedCurrency === currency.code && (
        <Ionicons name="checkmark" size={20} color="#10B981" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language & Region</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Settings Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Current Settings</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Language:</Text>
              <Text style={styles.summaryValue}>
                {languages.find(l => l.code === selectedLanguage)?.name}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Region:</Text>
              <Text style={styles.summaryValue}>
                {regions.find(r => r.code === selectedRegion)?.name}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Currency:</Text>
              <Text style={styles.summaryValue}>
                {currencies.find(c => c.code === selectedCurrency)?.name} ({selectedCurrency})
              </Text>
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="language" size={24} color="#A83442" />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Language</Text>
              <Text style={styles.sectionSubtitle}>Choose your preferred language</Text>
            </View>
          </View>
          
          <View style={styles.itemsList}>
            {languages.map((language) => (
              <LanguageItem key={language.code} language={language} />
            ))}
          </View>
        </View>

        {/* Region Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color="#A83442" />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Region</Text>
              <Text style={styles.sectionSubtitle}>Set your location for local content</Text>
            </View>
          </View>
          
          <View style={styles.itemsList}>
            {regions.map((region) => (
              <RegionItem key={region.code} region={region} />
            ))}
          </View>
        </View>

        {/* Currency Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={24} color="#A83442" />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Currency</Text>
              <Text style={styles.sectionSubtitle}>Display prices in your preferred currency</Text>
            </View>
          </View>
          
          <View style={styles.itemsList}>
            {currencies.map((currency) => (
              <CurrencyItem key={currency.code} currency={currency} />
            ))}
          </View>
        </View>

        {/* Format Examples */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye" size={24} color="#A83442" />
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Format Preview</Text>
              <Text style={styles.sectionSubtitle}>How information will appear</Text>
            </View>
          </View>
          
          <View style={styles.previewContent}>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Date Format:</Text>
              <Text style={styles.previewValue}>
                {new Date().toLocaleDateString(selectedLanguage)}
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Time Format:</Text>
              <Text style={styles.previewValue}>
                {new Date().toLocaleTimeString(selectedLanguage)}
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Currency Format:</Text>
              <Text style={styles.previewValue}>
                {(1234.56).toLocaleString(selectedLanguage, {
                  style: 'currency',
                  currency: selectedCurrency,
                })}
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Number Format:</Text>
              <Text style={styles.previewValue}>
                {(123456.789).toLocaleString(selectedLanguage)}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  placeholder: {
    width: 40,
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
  summaryContent: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  itemsList: {
    gap: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  currencySymbol: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currencySymbolText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A83442',
  },
  previewContent: {
    gap: 12,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'monospace',
  },
}); 