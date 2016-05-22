var api = {};
global.api = api;
api.net = require('net');

var socket = new api.net.Socket();

console.log("start client");

socket.connect({port: 1488, host: '127.0.0.1',}, function() 
{
    socket.on('data', function(data) 
	{
        console.log("(Client)received data " + data);

        var inputTask = JSON.parse(data);
        var response = {};

        response.resultRow = calculate(inputTask);
        response.rowIndex = inputTask.rowIndex;

        socket.write(JSON.stringify(response));
        console.log("(Client)Out" + response.resultRow);
    });

});

function calculate(task)
{
    var i_row = task.i_row;
    var k_row = task.k_row;
    var constant = task.constant;
    var resultRow = [];
    for(var j = 0;j < k_row.length;j++)	
        resultRow[j] = k_row[j] - i_row[j] * constant;
    
   return resultRow;
}