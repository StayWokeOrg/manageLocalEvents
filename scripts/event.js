(function (module) {

  // Event object
  function Event(opts) {
    for (var key in opts) {
      this[key] = opts[key]
    }
  }

  // Initialize Firebase
  var config = {
    apiKey: 'AIzaSyBw6HZ7Y4J1dATyC4-_mKmt3u0hLRRqthQ',
    authDomain: 'staywokesignups.firebaseapp.com',
    databaseURL: 'https://staywokesignups.firebaseio.com',
    storageBucket: 'staywokesignups.appspot.com',
    messagingSenderId: '47559178634',
  }

  firebase.initializeApp(config)

  // local ref to firebase
  var firebasedb = firebase.database()

  //auth with Google
  var provider = new firebase.auth.GoogleAuthProvider()

  // Sign in with google auth popup
  Event.signIn = function () {
    firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken
      // The signed-in user info.
      var user = result.user;
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode, errorMessage);
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
    });
  }

  // checks if there is a user, if not, prompt to sign in
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
    // User is signed in.
      console.log(user.displayName, ' is signed in');
    } else {
      Event.signIn()
      // No user is signed in.
    }
  });
  // TODO: Sign out button

  // writes to firebase
  Event.writetoFB = function (event) {
    console.log('saving to firebase');
    var newEvent = firebasedb.ref('events').push()
    newEvent.set(event)
  };

  // looks up the lat and lng of a zip code
  Event.lookupZip = function (zip) {
    return firebasedb.ref('/publicInfo/zips/' + zip).once('value').then(function(snapshot) {
      var location = new google.maps.LatLng(snapshot.val().LAT, snapshot.val().LNG)
      Event.returnNearest(location)
    })
  }

  // given a zip code return the nearest event
  Event.returnNearest = function (location) {
    firebase.database().ref('/events/').once('value').then(function(snapshot) {
      var locations = []
      snapshot.forEach(function (ele) {
        locations.push(ele.val())
      })
      // TODO: return a list of 5 or return within a radius
      // also not sure if google api is overkill depending on how many
      // events we have
      var position = locations.reduce(function (prev, curr) {
        var cpos = google.maps.geometry.spherical
        .computeDistanceBetween(location, new google.maps.LatLng(curr.lat, curr.long));
        var ppos = google.maps.geometry.spherical
        .computeDistanceBetween(location,  new google.maps.LatLng(prev.lat, prev.long));
        return cpos < ppos ? curr : prev;
      })
      console.log(position);
      newEventHandler.render(position.name+''+ position.address)
    })
  }

  // Get lat and lng of an address and save the event
  Event.getLatandLog = function (event, address) {
    $.ajax({
      url: 'https://maps.googleapis.com/maps/api/geocode/json',
      data: {
        'address': address
      },
      dataType: 'json',
      success: function (r) {
        console.log('success', r);
        event.lat = r.results[0].geometry.location.lat
        event.long = r.results[0].geometry.location.lng
        event.address = r.results[0].formatted_address
        Event.writetoFB(event)
        console.log(event);
      },
      error: function(e){
        console.log('error', e)
      }
    })
  }

  module.Event = Event
})(window)
