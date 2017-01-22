(function(module) {
  function Event (opts) {
    for (var key in opts) {
      this[key] = opts[key];
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

  var firebasedb = firebase.database()

  Event.writetoFB = function (event) {
    console.log('saving to firebase');
    var newEvent = firebasedb.ref('publicInfo/events').push()
    newEvent.set(event)
  };

  Event.getLatandLog = function(event, address) {
    $.ajax({
      url : 'https://maps.googleapis.com/maps/api/geocode/json',
      data : {
        'address' : address
      },
      dataType : 'json',
      success: function(r){
        console.log('success', r);
        event.lat = r.results[0].geometry.location.lat
        event.long = r.results[0].geometry.location.lng
        Event.writetoFB(event)
        console.log(event);
      },
      error: function(e){
        console.log('error', e);
      }
    })
  }

  module.Event = Event;
})(window);
