import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
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
  flightNumber: string;
  departure: {
    time: string;
    code: string;
    location: string;
    terminal: string;
    gate: string;
  };
  arrival: {
    time: string;
    code: string;
    location: string;
    terminal: string;
    gate: string;
  };
  price: string;
  duration: string;
  stops: string;
  baggage: string;
  refundable: boolean;
  seatSelection: boolean;
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
    flightNumber: 'GA 123',
    departure: {
      time: '09:00 AM',
      code: 'SBY',
      location: 'Surabaya, East Java',
      terminal: 'Terminal 1',
      gate: 'Gate A12',
    },
    arrival: {
      time: '13:30 PM',
      code: 'DPS',
      location: 'Denpasar, Bali',
      terminal: 'Terminal 2',
      gate: 'Gate B7',
    },
    price: '$320',
    duration: '4h 30m',
    stops: 'Non-stop',
    baggage: '20kg checked + 7kg cabin',
    refundable: true,
    seatSelection: true,
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
    flightNumber: 'JT 456',
    departure: {
      time: '10:00 AM',
      code: 'SBY',
      location: 'Surabaya, East Java',
      terminal: 'Terminal 1',
      gate: 'Gate A8',
    },
    arrival: {
      time: '15:30 PM',
      code: 'DPS',
      location: 'Denpasar, Bali',
      terminal: 'Terminal 1',
      gate: 'Gate C3',
    },
    price: '$479',
    duration: '5h 30m',
    stops: '1 Stop in Jakarta',
    baggage: '15kg checked + 7kg cabin',
    refundable: false,
    seatSelection: true,
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
    flightNumber: 'QG 789',
    departure: {
      time: '12:30 PM',
      code: 'SBY',
      location: 'Surabaya, East Java',
      terminal: 'Terminal 2',
      gate: 'Gate B15',
    },
    arrival: {
      time: '17:00 PM',
      code: 'DPS',
      location: 'Denpasar, Bali',
      terminal: 'Terminal 1',
      gate: 'Gate A9',
    },
    price: '$285',
    duration: '4h 30m',
    stops: 'Non-stop',
    baggage: '20kg checked + 7kg cabin',
    refundable: true,
    seatSelection: false,
  },
];

export const FlightResultsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleCard = (flightId: string) => {
    const newFlippedCards = new Set(flippedCards);
    if (newFlippedCards.has(flightId)) {
      newFlippedCards.delete(flightId);
    } else {
      newFlippedCards.add(flightId);
    }
    setFlippedCards(newFlippedCards);
  };

  const FlightCard = ({ flight }: { flight: FlightData }) => {
    const isFlipped = flippedCards.has(flight.id);

    return (
      <View style={styles.cardContainer}>
        {/* Front of Card */}
        {!isFlipped && (
          <TouchableOpacity
            style={styles.flightCard}
            onPress={() => toggleCard(flight.id)}
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
            </View>

            {/* Bottom Row - Duration and Price */}
            <View style={styles.bottomRow}>
              <Text style={styles.duration}>{flight.duration}</Text>
              <View style={styles.flightPrice}>
                <Text style={styles.priceAmount}>{flight.price}</Text>
                <Text style={styles.pricePer}>/pax</Text>
              </View>
            </View>

            {/* View Details Button */}
            <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => toggleCard(flight.id)}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Back of Card - Detailed View */}
        {isFlipped && (
          <View style={styles.flightCardDetailed}>
            {/* Ticket cutouts */}
            <View style={[styles.cutout, styles.leftCutout]} />
            <View style={[styles.cutout, styles.rightCutout]} />
            
            {/* Header with Close */}
            <View style={styles.detailHeader}>
              <View style={styles.airlineInfo}>
                <View style={[styles.airlineLogo, { backgroundColor: flight.airline.color }]}>
                  <Text style={styles.airlineLogoText}>{flight.airline.logo}</Text>
                </View>
                <View>
                  <Text style={styles.airlineName}>{flight.airline.name}</Text>
                  <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => toggleCard(flight.id)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Flight Details */}
            <View style={styles.detailsSection}>
              {/* Route Info */}
              <View style={styles.routeDetails}>
                <View style={styles.routePoint}>
                  <Text style={styles.routeTime}>{flight.departure.time}</Text>
                  <Text style={styles.routeCode}>{flight.departure.code}</Text>
                  <Text style={styles.terminalInfo}>{flight.departure.terminal}</Text>
                  <Text style={styles.gateInfo}>{flight.departure.gate}</Text>
                </View>
                
                <View style={styles.routeMiddleDetailed}>
                  <Text style={styles.durationText}>{flight.duration}</Text>
                  <View style={styles.routeLine} />
                  <Text style={styles.stopsText}>{flight.stops}</Text>
                </View>
                
                <View style={styles.routePoint}>
                  <Text style={styles.routeTime}>{flight.arrival.time}</Text>
                  <Text style={styles.routeCode}>{flight.arrival.code}</Text>
                  <Text style={styles.terminalInfo}>{flight.arrival.terminal}</Text>
                  <Text style={styles.gateInfo}>{flight.arrival.gate}</Text>
                </View>
              </View>

              {/* Flight Info */}
              <View style={styles.flightInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Baggage:</Text>
                  <Text style={styles.infoValue}>{flight.baggage}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Refundable:</Text>
                  <Text style={[styles.infoValue, { color: flight.refundable ? '#2ecc71' : '#e74c3c' }]}>
                    {flight.refundable ? 'Yes' : 'No'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Seat Selection:</Text>
                  <Text style={[styles.infoValue, { color: flight.seatSelection ? '#2ecc71' : '#e74c3c' }]}>
                    {flight.seatSelection ? 'Available' : 'Not Available'}
                  </Text>
                </View>
              </View>

              {/* Price and Book Button */}
              <View style={styles.bookingSection}>
                <View style={styles.priceSection}>
                  <Text style={styles.totalLabel}>Total Price</Text>
                  <Text style={styles.totalPrice}>{flight.price}</Text>
                  <Text style={styles.perPax}>/pax</Text>
                </View>
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Result Search</Text>
          {/* Removed the burger menu button */}
          <View style={styles.spacer} />
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
        
        {/* Add some bottom padding for the floating button */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Sort & Filter Button */}
      <TouchableOpacity style={styles.floatingSortFilter}>
        <Text style={styles.sortFilterText}>Sort & Filter</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D6D5C9',
  },
  header: {
    backgroundColor: '#000000',
    paddingTop: 50, // Account for status bar
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
  spacer: {
    width: 40,
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
    backgroundColor: '#D6D5C9',
  },
  scrollContent: {
    paddingTop: 15,
  },
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  flightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  flightCardDetailed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
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
    marginBottom: 16,
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
  flightNumber: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
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
    marginBottom: 16,
  },
  routeEndpoint: {
    flex: 1,
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
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  duration: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
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
  viewDetailsButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailsSection: {
    flex: 1,
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routePoint: {
    alignItems: 'center',
    flex: 1,
  },
  terminalInfo: {
    fontSize: 10,
    color: '#6c757d',
    marginBottom: 1,
  },
  gateInfo: {
    fontSize: 10,
    color: '#6c757d',
  },
  routeMiddleDetailed: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  durationText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 4,
  },
  stopsText: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '500',
    marginTop: 4,
  },
  flightInfo: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  bookingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceSection: {
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#A83442',
  },
  perPax: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#A83442',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
  floatingSortFilter: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    marginLeft: -60,
    backgroundColor: '#A83442',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#A83442',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sortFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 