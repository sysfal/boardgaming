//import {MDCTextField} from '@material/textfield';

//$(function () {
    let id = '';
    let state = 0;
    let info = {};
    let name = 'unkown';

    const socket = io();

    socket.on('connect', function () {
        id = socket.id;
        console.log('socket', id);
        //$('#messages').append($('<li>').text('I am ' + id));
    });

    $('form').submit(function () {
        console.log($('#m').val());
        socket.emit('chat message', $('#m').val()); // emit an event to the socket
        //$('#m').val('');
        return false;
    });

    $('#join2').click(function(){
        join();
    });

    $(document).keyup(function(event) {
        if ($("#m2").is(":focus") && event.key == "Enter") {
            join();
        }
    });

    socket.on('chat message', function (message) {  // listen to the event
        console.log(message);
        //$('#messages').append($('<li>').text(message));
        //window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('state', function (stateObj) {  // listen to the event
        console.log('state', stateObj);
        //$('#messages').append($('<li>').text('state ' + stateObj.state));

        state = stateObj.state;
        info = stateObj.info;
        $('[id^=state_]').css('display', 'none');
        $('#state_' + state).css("display", "block");

        if (state == 1) {
            $('#users').empty();
            for (const u of info.users) {
                console.log(u);
                if (u.socketId === socket.id) {
                    $('#name').text(u.name);
                }
                $('#users').append($('<li>').text(u.name));
            }
        }
    });
//});

function join() {
    const name = $('#m2').val();
    if (name === '') {
        return;
    }
    console.log(name);
    socket.emit('join', name); // emit an event to the socket
}
