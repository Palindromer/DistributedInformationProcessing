var api = {};
global.api = api;
api.net = require('net');

var workers = [];
var A = [], B = []; // Ax=B

SystemsExampleInit();
function SystemsExampleInit()
{
    for(i = 0;i < 4;i++)
	{
		A[i] = [];
	}
	
    A = [[5, 13, 14,4],
         [1, 2,  4, 5],
         [3, 1,  17,15],
         [3, 4,  4, 18]];
    B = [2,
        -5,
        13,
        -5];
}

var problemContext = {matrix: A,i:0, k:1};

var server = api.net.createServer(function (socket) 
{
    console.log('Connected: ' + socket.localAddress);
    socket.setNoDelay();
    var workerState = {};
    workerState.worker = socket;
    workerState.isBusy = false;
    workers.push(workerState);
    socket.on('data', function (data) 
	{
        handleResponse(data);
        calculating(socket, problemContext);
    });

}).listen(1488);

function handleResponse(data) 
{
    var responseTask = JSON.parse(data);
    var resultRow = responseTask.resultRow;
    console.log("Received: " + resultRow);
    A[responseTask.rowIndex] = resultRow;
}


setTimeout(startCalculating, 6000);
function startCalculating()
{
    workers.forEach(function (workerState)
	{
        calculating(workerState.worker, problemContext);
    });
}

function calculating(socket, context)
{
    var matrix = context.matrix;
    var i = context.i, k = context.k;
    if(context.i < matrix.length)
	{
        if(context.k < matrix.length)
		{
            var constant = matrix[k][i] / matrix[i][i];
            sendTask(socket,createTask(matrix[i], matrix[k], constant, k));
            context.k++;
        }
        else 
		{
            context.i = context.i + 1;
            context.k = context.i + 1;
            calculating(socket,context);
        }
    }
    else end();
    
}

function createTask(i_row,k_row, constant, rowIndex) 
{
    var localTask = {};
    localTask.i_row = i_row;
    localTask.k_row = k_row;
    localTask.constant = constant;
    localTask.rowIndex = rowIndex;
    return localTask;
}

function sendTask(socket, task)
{
    socket.write(JSON.stringify(task));
    console.log("(Server) Task was given: "+ task);
}

function end() 
{
    console.log("End!");
	// Matrix display
    for(var i=0; i< A.length; i++)
	{
        console.log(A[i]);
    }
}


