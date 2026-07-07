import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Modal, 
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import { Search, ChevronDown, X } from 'lucide-react-native';
import { Colors, Fonts } from '../constants/theme';

interface Option {
  id: string | number;
  label: string;
}

interface SearchableSelectProps {
  data: Option[];
  value: string | number;
  onSelect: (id: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

export function SearchableSelect({ 
  data, 
  value, 
  onSelect, 
  placeholder = "Select an option",
  searchPlaceholder = "Search..."
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = data.find(item => item.id === value);

  const filteredData = data.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (id: string | number) => {
    onSelect(id);
    setIsOpen(false);
    setSearchQuery('');
  };

  // On Web, we can just use a relative absolute positioned dropdown, 
  // on native a Modal is usually better to escape clipping, but since this is 
  // meant to be simple and cross-platform, we'll use a Modal for both.
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selector} 
        activeOpacity={0.8}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.selectorText, !selectedOption && styles.placeholderText]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown color={Colors.textSecondary} size={20} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownContainer}>
                
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>{placeholder}</Text>
                  <TouchableOpacity onPress={() => setIsOpen(false)}>
                    <X color={Colors.textSecondary} size={24} />
                  </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                  <Search color={Colors.textSecondary} size={18} style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={searchPlaceholder}
                    placeholderTextColor={Colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus={Platform.OS === 'web'}
                  />
                </View>

                <ScrollView style={styles.listContainer} keyboardShouldPersistTaps="handled">
                  {filteredData.length === 0 ? (
                    <Text style={styles.emptyText}>No results found</Text>
                  ) : (
                    filteredData.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.option,
                          value === item.id && styles.optionSelected
                        ]}
                        onPress={() => handleSelect(item.id)}
                      >
                        <Text style={[
                          styles.optionText,
                          value === item.id && styles.optionTextSelected
                        ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    height: 48,
  },
  selectorText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Fonts.regular,
    flex: 1,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dropdownContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      },
      default: {
        elevation: 8,
      }
    })
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontFamily: Fonts.regular,
    padding: 0, // Remove default Android padding
  },
  listContainer: {
    maxHeight: 300,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionSelected: {
    backgroundColor: Colors.primary + '20',
  },
  optionText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 24,
    fontFamily: Fonts.regular,
  }
});
