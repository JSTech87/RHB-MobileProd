import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/* ---------- Types ---------- */
interface FlightData {
  id: string;
  airline: { name: string; code: string; logo?: string; color?: string };
  flightNumber: string;
  cabinClass: string;
  departure: { time: string; code: string; location: string; date?: string };
  arrival: { time: string; code: string; location: string; date?: string };
  price: string;        // “$320”
  duration: string;     // “4h 30m”
  stops?: string;       // “Non-stop” | “1 Stop in …”
}

interface PassengerInfo {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/* ---------- Component ---------- */
export const FlightCheckoutScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { flight, passengerCount = 1 } = route.params as { flight: FlightData; passengerCount: number };

  /* ----- State ----- */
  const [passenger, setPassenger] = useState<PassengerInfo>({
    title: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [extras, setExtras] = useState({
    baggage: false,
    seat: false,
    meal: false,
    insurance: false,
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple'>('card');

  /* ----- Helpers ----- */
  const toggleExtra = (key: keyof typeof extras) =>
    setExtras((prev) => ({ ...prev, [key]: !prev[key] }));

  const calcTotal = () => {
    const base = Number(flight.price.replace('$', ''));
    const add = (extras.baggage ? 25 : 0) + (extras.seat ? 15 : 0) + (extras.meal ? 12 : 0) + (extras.insurance ? 18 : 0);
    return base + add;
  };

  const confirmBooking = () => {
    if (!passenger.firstName || !passenger.lastName || !passenger.email) {
      Alert.alert('Missing info', 'Please fill in all required passenger details');
      return;
    }
    Alert.alert(
      'Booking confirmed',
      `Your flight is booked for $${calcTotal().toFixed(2)}`,
      [{ text: 'Done', onPress: () => navigation.popToTop() }],
    );
  };

  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ---------- Header ---------- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flight Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ---------- Flight summary ---------- */}
      <View style={styles.summary}>
        <View>
          <Text style={styles.routeText}>
            {flight.departure.code} → {flight.arrival.code}
          </Text>
          <Text style={styles.flightLine}>
            {flight.airline.name} • {flight.flightNumber} • {flight.cabinClass}
          </Text>
        </View>
        <Text style={styles.summaryPrice}>{flight.price}</Text>
      </View>

      {/* ---------- Body ---------- */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* ----- Passenger ----- */}
          <Section title="Passenger details">
            <View style={styles.titleRow}>
              {['Mr', 'Ms', 'Mrs'].map((t) => (
                <Chip
                  key={t}
                  label={t}
                  active={passenger.title === t}
                  onPress={() => setPassenger((p) => ({ ...p, title: t }))}
                />
              ))}
            </View>

            <InputRow>
              <Input
                label="First name *"
                value={passenger.firstName}
                onChange={(v) => setPassenger((p) => ({ ...p, firstName: v }))}
              />
              <Input
                label="Last name *"
                value={passenger.lastName}
                onChange={(v) => setPassenger((p) => ({ ...p, lastName: v }))}
              />
            </InputRow>

            <Input
              label="Email *"
              keyboardType="email-address"
              value={passenger.email}
              onChange={(v) => setPassenger((p) => ({ ...p, email: v }))}
            />
            <Input
              label="Phone"
              keyboardType="phone-pad"
              value={passenger.phone}
              onChange={(v) => setPassenger((p) => ({ ...p, phone: v }))}
            />
          </Section>

          {/* ----- Extras ----- */}
          <Section title="Travel extras">
            <ExtraRow
              label="Extra baggage"
              desc="23 kg checked bag"
              price={25}
              active={extras.baggage}
              onToggle={() => toggleExtra('baggage')}
            />
            <ExtraRow
              label="Seat selection"
              desc="Pick preferred seat"
              price={15}
              active={extras.seat}
              onToggle={() => toggleExtra('seat')}
            />
            <ExtraRow
              label="Special meal"
              desc="Dietary preference"
              price={12}
              active={extras.meal}
              onToggle={() => toggleExtra('meal')}
            />
            <ExtraRow
              label="Travel insurance"
              desc="Trip protection"
              price={18}
              active={extras.insurance}
              onToggle={() => toggleExtra('insurance')}
            />
          </Section>

          {/* ----- Payment ----- */}
          <Section title="Payment method">
            <PaymentOption
              icon="card"
              label="Credit / Debit card"
              active={paymentMethod === 'card'}
              onPress={() => setPaymentMethod('card')}
            />
            <PaymentOption
              icon="logo-paypal"
              label="PayPal"
              active={paymentMethod === 'paypal'}
              onPress={() => setPaymentMethod('paypal')}
            />
            <PaymentOption
              icon="logo-apple"
              label="Apple Pay"
              active={paymentMethod === 'apple'}
              onPress={() => setPaymentMethod('apple')}
            />
          </Section>

          {/* ----- Price breakdown ----- */}
          <Section title="Price breakdown">
            <PriceRow label="Base fare" value={flight.price} />
            {extras.baggage && <PriceRow label="Extra baggage" value="+$25" />}
            {extras.seat && <PriceRow label="Seat selection" value="+$15" />}
            {extras.meal && <PriceRow label="Special meal" value="+$12" />}
            {extras.insurance && <PriceRow label="Insurance" value="+$18" />}
            <View style={styles.divider} />
            <PriceRow
              label="Total"
              value={`$${calcTotal().toFixed(2)}`}
              total
            />
          </Section>

          <View style={{ height: 90 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------- CTA ---------- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={confirmBooking}>
          <Text style={styles.ctaText}>Complete booking</Text>
          <Text style={styles.ctaSub}>${calcTotal().toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ---------- Re-usable sub-components ---------- */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const InputRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ flexDirection: 'row', gap: 12 }}>{children}</View>
);

const Input: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: any;
}> = ({ label, value, onChange, keyboardType }) => (
  <View style={{ flex: 1, marginTop: 14 }}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholderTextColor="#999"
      value={value}
      onChangeText={onChange}
      keyboardType={keyboardType}
    />
  </View>
);

const Chip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[
      styles.chip,
      active && { backgroundColor: '#A83442', borderColor: '#A83442' },
    ]}
    onPress={onPress}
  >
    <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
  </TouchableOpacity>
);

const ExtraRow: React.FC<{
  label: string;
  desc: string;
  price: number;
  active: boolean;
  onToggle: () => void;
}> = ({ label, desc, price, active, onToggle }) => (
  <TouchableOpacity style={styles.extraRow} onPress={onToggle}>
    <View style={{ flex: 1 }}>
      <Text style={styles.extraLabel}>{label}</Text>
      <Text style={styles.extraDesc}>{desc}</Text>
    </View>
    <Text style={styles.extraPrice}>+${price}</Text>
    <View style={[styles.checkBox, active && { backgroundColor: '#A83442', borderColor: '#A83442' }]}>
      {active && <Ionicons name="checkmark" size={16} color="#fff" />}
    </View>
  </TouchableOpacity>
);

const PaymentOption: React.FC<{
  icon: any;
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ icon, label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.paymentRow, active && { borderColor: '#A83442', backgroundColor: '#FFF8F9' }]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={22} color={active ? '#A83442' : '#666'} />
    <Text style={[styles.paymentLabel, active && { color: '#A83442', fontWeight: '500' }]}>
      {label}
    </Text>
    <View style={[styles.radio, active && { borderColor: '#A83442' }]}>
      {active && <View style={styles.radioDot} />}
    </View>
  </TouchableOpacity>
);

const PriceRow: React.FC<{ label: string; value: string; total?: boolean }> = ({
  label,
  value,
  total,
}) => (
  <View style={styles.priceRow}>
    <Text style={[styles.priceLabel, total && { fontWeight: '600', fontSize: 17 }]}>{label}</Text>
    <Text style={[styles.priceValue, total && { color: '#A83442', fontWeight: '700' }]}>{value}</Text>
  </View>
);

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D6D5C9' },

  header: {
    backgroundColor: '#000',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },

  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  routeText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  flightLine: { color: '#ccc', fontSize: 14 },
  summaryPrice: { color: '#fff', fontSize: 18, fontWeight: '700' },

  scroll: { padding: 20 },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 12 },

  /* Inputs */
  inputLabel: { fontSize: 14, color: '#333', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#000',
  },
  titleRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipText: { color: '#666', fontWeight: '500' },

  /* Extras */
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
  },
  extraLabel: { fontSize: 15, fontWeight: '500', color: '#000' },
  extraDesc: { fontSize: 13, color: '#666' },
  extraPrice: { fontSize: 15, fontWeight: '600', color: '#A83442', marginHorizontal: 8 },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Payment */
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  paymentLabel: { flex: 1, marginLeft: 12, fontSize: 15, color: '#333' },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A83442',
  },

  /* Prices */
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  priceLabel: { fontSize: 15, color: '#666' },
  priceValue: { fontSize: 15, color: '#000', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 10 },

  /* Footer */
  footer: { backgroundColor: '#fff', padding: 20 },
  cta: {
    backgroundColor: '#A83442',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  ctaSub: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
}); 