import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList, StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';

interface Contact {
  id: string;
  name: string;
  phone: string;
}

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Load contacts when screen opens
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const saved = await AsyncStorage.getItem('trustedContacts');
      if (saved) setContacts(JSON.parse(saved));
    } catch (e) {
      console.log('Error loading contacts');
    }
  };

  const saveContacts = async (updatedContacts: Contact[]) => {
    await AsyncStorage.setItem('trustedContacts', JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const addContact = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }
    if (contacts.length >= 5) {
      Alert.alert('Limit Reached', 'You can add maximum 5 trusted contacts');
      return;
    }
    const newContact: Contact = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
    };
    const updated = [...contacts, newContact];
    await saveContacts(updated);
    setName('');
    setPhone('');
    Alert.alert('✅ Contact Added', `${name} has been added as trusted contact`);
  };

  const deleteContact = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = contacts.filter(c => c.id !== id);
            await saveContacts(updated);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trusted Contacts</Text>
      <Text style={styles.subheader}>
        These people will be alerted during SOS ({contacts.length}/5)
      </Text>

      {/* Add Contact Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Contact Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#aaa"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.addButton} onPress={addContact}>
          <Text style={styles.addButtonText}>+ Add Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No trusted contacts added yet</Text>
          <Text style={styles.emptySubtext}>Add contacts above to use SOS feature</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.contactCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>{item.phone}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteContact(item.id)}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff0f3',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#c0392b',
  },
  subheader: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    marginBottom: 20,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  addButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#ccc',
    marginTop: 6,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactPhone: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    color: '#e74c3c',
    fontSize: 18,
    fontWeight: 'bold',
  },
});