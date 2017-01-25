(function(module) {
  var firebasedb = firebase.database()

  var newEventHandler = {};

  //submit a new event
  newEventHandler.save = function (e) {
    e.preventDefault();
    // check if the date is in the future
    var date = new Date($("#date").val());
    if (date - new Date < 0) {
      $('#date-alert').removeClass('hidden')
      $('#date-alert').focus()
    }
    else {
      $('#date-alert').addClass('hidden')
      var newEvent = new Event( $('#save-event input').get().reduce(function(newObj, cur){
        newObj[cur.id] = $(cur).val();
        return newObj;
      }, {})
    );
      newEvent[date] = date
      Event.getLatandLog(newEvent, newEvent.address);
    }
  };


  newEventHandler.lookup = function (e) {
    e.preventDefault();
    Event.lookupZip($('#look-up input').val())
  }

  newEventHandler.render = function (data) {
    // TODO: add templating to render this
    $('#nearest').text(data)
  }

  $('#save-event').on('submit', newEventHandler.save);
  $('#look-up').on('submit', newEventHandler.lookup);

  module.newEventHandler = newEventHandler;
})(window);
