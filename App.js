/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import Contacts from 'react-native-contacts';
import axios from 'axios';
import {
  ActivityIndicator,
  PermissionsAndroid,
  TextInput,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  Linking,
  Alert,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const BASE_URL = 'http://anamapp-contact-exporter.herokuapp.com/';
// const BASE_URL = 'http://4923dd065548.ngrok.io/';
// const BASE_URL = 'http://101.50.0.252/panel/';
const API_BASE_URL = BASE_URL + 'api/';
// console.log(API_BASE_URL);

const App: () => React$Node = () => {
  const [isGranted, setIsGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function store() {
    setIsLoading(true);
    axios
      .post(API_BASE_URL + 'contacts', {
        phone_number: '0887483',
        name: 'hairul anam',
        data: contacts,
        user_id: userId,
      })
      .then((res) => {
        console.log(res.data);
        Alert.alert('Success', 'Success sync with server');
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 500) {
          console.log(error.response.data.message);
          console.log(error.response.data);
        }
        Alert.alert('Error', error.response.data.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function grant() {
    Contacts.checkPermission()
      .then((permission) => {
        // alert('halo');
        console.log(permission);
        // Contacts.PERMISSION_AUTHORIZED || Contacts.PERMISSION_UNDEFINED || Contacts.PERMISSION_DENIED
        if (permission === 'undefined') {
          Contacts.requestPermission().then((permission) => {
            // ...
          });
        }
        if (permission === 'authorized') {
          setIsGranted(true);
          Contacts.getAll().then((contacts) => {
            // console.log(contacts.length);
            setContacts(contacts);
          });
        }
        if (permission === 'denied') {
          // alert('halo');
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            {
              title: 'Contacts',
              message: 'This app would like to view your contacts.',
              buttonPositive: 'Please accept bare mortal',
            },
          )
            .then(() => {})
            .catch();
          // .then(Contacts.getAll)
          // .then(contacts => {
          // })
          // Contacts.requestPermission()
          //   .then((permission) => {})
          //   .catch((error) => {
          //     console.log(error);
          //   });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function onPress() {
    if (isLoggedIn) {
      if (isGranted) {
        store();
      } else {
        grant();
      }
    } else {
      // setIsLoggedIn(true);
      if (email !== '' && password !== '') {
        setIsLoading(true);
        console.log('email', email, password);
        axios
          .post(API_BASE_URL + 'login', {
            email,
            password,
          })
          .then((res) => {
            try {
              setUserId(res.data.id);
              setUser(res.data);
              setIsLoggedIn(true);
              console.log(res.data);
              Alert.alert('Info', JSON.stringify(res.data));
            } catch (error) {
              console.log(error);
            }
          })
          .catch((error) => {
            // console.log(error);
            try {
              if (error.response.status === 500) {
                console.log(error.response.data.message);
              } else if (error.response.status === 422) {
                console.log(error.response.data.errors);
              }
              Alert.alert('Error', error.response.data.message);
            } catch (err) {
              console.log(err);
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        Alert.alert('Error', 'email and password required');
      }
    }
  }

  function onChangeEmail(email) {
    setEmail(email);
  }
  function onChangePassword(password) {
    setPassword(password);
  }

  function logout() {
    setIsLoggedIn(false);
  }

  function openInWeb() {
    if (user !== null) {
      const token = user.api_token;
      const url = BASE_URL + 'login/with-token/' + token;
      Linking.openURL(url).catch((err) =>
        console.log('An error occurred', err),
      );
    }
  }

  useEffect(() => {
    grant();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={[styles.sectionTitle, {marginBottom: 10}]}>
        Contact Sync With Server
      </Text>
      {isLoading && <ActivityIndicator size="large" color="blue" />}
      {!isLoading &&
        (isLoggedIn ? (
          <View style={{alignItems: 'center'}}>
            {contacts.length > 0 && <Text>{contacts.length} Contact(s)</Text>}
            <View style={{marginVertical: 10}}>
              <Button
                title={isGranted ? 'Sync now' : 'Get Permissions'}
                onPress={onPress}
              />
            </View>
            <View style={{marginVertical: 10}}>
              <Button title={'Open in web'} onPress={openInWeb} />
            </View>
            <View style={{marginBottom: 10}}>
              <Button title={'Logout'} onPress={logout} />
            </View>
          </View>
        ) : (
          <View
            style={{
              height: 100,
              // backgroundColor: 'red',
              width: '100%',
              paddingHorizontal: 20,
            }}>
            <View style={{flex: 1}}>
              <TextInput
                onChangeText={onChangeEmail}
                placeholder="Email"
                keyboardType="email-address"
                style={{
                  borderWidth: 1,
                  borderColor: '#888888',
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              />
              <TextInput
                onChangeText={onChangePassword}
                secureTextEntry={true}
                placeholder="Password"
                style={{
                  borderWidth: 1,
                  borderColor: '#888888',
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              />
              <Button title={'Login'} onPress={onPress} />
            </View>
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
