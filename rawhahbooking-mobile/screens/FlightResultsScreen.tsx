import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface FlightData {
  id: string;
  airline: {
    name: string;
    code: string;
    logo: string;
    color: string;
  };
  flightType: string;
  departure: {
    time: string;
    code: string;
    location: string;
  };
  arrival: {
    time: string;
    code: string;
    location: string;
  };
  price: string;
}

const mockFlights: FlightData[] = [
  {
    id: '1',
    airline: {
      name: 'Garuda Indonesia',
      code: 'GA',
      logo: 'GA',
      color: '#0066cc',
    },
    flightType: 'Type A330',
    departure: {
      time: '09:00 AM',
      code: 'SBY',
      location: 'Surabaya, East Java',
    },
    arrival: {
      time: '13:30 PM',
      code: 'DPS',
      location: 'Denpasar, Bali',
    },
    price: '$320',
  },
  {
    id: '2',
    airline: {
      name: 'Lion Air',
      code: 'LA',
      logo: 'LA',
      color: '#A83442',
    },
    flightType: 'Type JT-25',
    departure: {
      time: '10:00 AM',
      code: 'SBY',
      location: 'Surabaya, East Java',
    },
    arrival: {
      time: '15:30 PM',
      code: 'DPS',
      location: 'Denpasar, Bali',
    },
    price: '$479',
  },
  {
    id: '3',
    airline: {
      name: 'Citilink',
      code: 'CL',
      logo: 'CL',
      color: '#2ecc71',
    },
    flightType: 'Type JT-15',
    departure: {
      time: '12:30 PM',
      code: 'SBY',
      location: 'Surabaya, East Java',
    },
    arrival: {
      time: '17:00 PM',
      code: 'DPS',
      location: 'Denpasar, Bali',
    },
    price: '$285',
  },
];

export const FlightResultsScreen: React.FC = () => {
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);

  const FlightCard = ({ flight }: { flight: FlightData }) => (
    <TouchableOpacity
      style={[
        styles.flightCard,
        selectedFlight === flight.id && styles.selectedCard,
      ]}
      onPress={() => setSelectedFlight(flight.id)}
      activeOpacity={0.9}
    >
      {/* Ticket cutouts */}
      <View style={[styles.cutout, styles.leftCutout]} />
      <View style={[styles.cutout, styles.rightCutout]} />
      
      {/* Airline Header */}
      <View style={styles.airlineHeader}>
        <View style={styles.airlineInfo}>
          <View style={[styles.airlineLogo, { backgroundColor: flight.airline.color }]}>
            <Text style={styles.airlineLogoText}>{flight.airline.logo}</Text>
          </View>
          <View style={styles.airlineText}>
            <Text style={styles.airlineLabel}>Airlines</Text>
            <Text style={styles.airlineName}>{flight.airline.name}</Text>
          </View>
        </View>
        <View style={styles.flightType}>
          <Text style={styles.flightTypeText}>{flight.flightType}</Text>
        </View>
      </View>

      {/* Flight Route */}
      <View style={styles.flightRoute}>
        <View style={styles.routeEndpoint}>
          <Text style={styles.routeTime}>{flight.departure.time}</Text>
          <Text style={styles.routeCode}>{flight.departure.code}</Text>
          <Text style={styles.routeLocationName}>{flight.departure.location}</Text>
        </View>

        <View style={styles.routeMiddle}>
          <View style={styles.routeLine} />
          <View style={styles.routePlaneIcon}>
            <Text style={styles.planeIcon}>✈</Text>
          </View>
        </View>

        <View style={styles.routeEndpoint}>
          <Text style={styles.routeTime}>{flight.arrival.time}</Text>
          <Text style={styles.routeCode}>{flight.arrival.code}</Text>
          <Text style={styles.routeLocationName}>{flight.arrival.location}</Text>
        </View>

        <View style={styles.flightPrice}>
          <Text style={styles.priceAmount}>{flight.price}</Text>
          <Text style={styles.pricePer}>/pax</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Result Search</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>≡</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.routeInfo}>
          <View style={styles.routeLocation}>
            <Text style={styles.airportCode}>SBY</Text>
            <Text style={styles.airportName}>Surabaya, East Java</Text>
          </View>
          <View style={styles.routeArrow}>
            <Text style={styles.flightIcon}>✈</Text>
            <Text style={styles.routeDate}>Dec 21, 2023</Text>
          </View>
          <View style={styles.routeLocation}>
            <Text style={styles.airportCode}>DPS</Text>
            <Text style={styles.airportName}>Denpasar, Bali</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mockFlights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Text style={styles.resultsCount}>12 flights found for Dec 21, 2023</Text>
      </View>

      {/* Floating Sort & Filter Button */}
      <TouchableOpacity style={styles.floatingSortFilter}>
        <Text style={styles.sortFilterIcon}>⚙</Text>
        <Text style={styles.sortFilterText}>Sort & Filter</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D6D5C9',
  },
  header: {
    backgroundColor: '#000000',
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A83442',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  routeLocation: {
    alignItems: 'center',
  },
  airportCode: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 2,
  },
  airportName: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  routeArrow: {
    alignItems: 'center',
    gap: 5,
  },
  flightIcon: {
    color: '#A83442',
    fontSize: 24,
    transform: [{ rotate: '90deg' }],
  },
  routeDate: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
  },
  mainContent: {
    flex: 1,
    paddingTop: 15,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  flightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 12,
    marginBottom: 8,
    minHeight: 130,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  selectedCard: {
    borderColor: '#A83442',
    borderWidth: 2,
  },
  cutout: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D6D5C9',
    top: '50%',
    marginTop: -6,
    zIndex: 2,
  },
  leftCutout: {
    left: -6,
  },
  rightCutout: {
    right: -6,
  },
  airlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  airlineLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  airlineLogoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  airlineText: {
    flexDirection: 'column',
  },
  airlineLabel: {
    fontSize: 10,
    color: '#6c757d',
    marginBottom: 1,
  },
  airlineName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  flightType: {
    backgroundColor: 'rgba(168, 52, 66, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  flightTypeText: {
    color: '#A83442',
    fontSize: 10,
    fontWeight: '600',
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeEndpoint: {
    flex: 0,
    alignItems: 'center',
  },
  routeTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  routeCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 1,
  },
  routeLocationName: {
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
    maxWidth: 80,
  },
  routeMiddle: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
    position: 'relative',
  },
  routeLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#e9ecef',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginVertical: 4,
  },
  routePlaneIcon: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    marginTop: -10,
  },
  planeIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    transform: [{ rotate: '90deg' }],
  },
  flightPrice: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#A83442',
    marginBottom: 1,
  },
  pricePer: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '500',
  },
  bottomAction: {
    padding: 20,
    backgroundColor: '#D6D5C9',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  floatingSortFilter: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    marginLeft: -75,
    backgroundColor: '#A83442',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#A83442',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    gap: 8,
  },
  sortFilterIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  sortFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 