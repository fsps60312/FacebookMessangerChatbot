'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const request = require('request');
const message_handler=require('./message_handler');


// Handles messages events
function handleMessage(sender_psid, received_message) {
	let response;
	// Check if the message contains text
	if (received_message.text) {
		console.log(`request_text: ${received_message.text}`);
		// Create the payload for a basic text message
		const response_text=message_handler.get_response_text(sender_psid,received_message.text);
		console.log(`response_text: ${response_text}`);
		response = {
			"text": response_text
		};
	} 

	// Sends the response message
	callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
	// Construct the message body
	let request_body = {
		"recipient": {
			"id": sender_psid
		},
		"message": response
	}

	// Send the HTTP request to the Messenger Platform
	request({
		"uri": "https://graph.facebook.com/v2.6/me/messages",
		"qs": { "access_token": PAGE_ACCESS_TOKEN },
		"method": "POST",
		"json": request_body
	}, (err, res, body) => {
		if (!err) {
			console.log(`message sent!`);
		} else {
			console.error("Unable to send message:" + err);
		}
	}); 
}


/*process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
let https=require('https');
let http=require('http');
let fs=require('fs');
var credentials=
	{
		key:fs.readFileSync('./server-key.pem','utf8'),
		ca:[fs.readFileSync('./cert.pem','utf8')],
		cert: fs.readFileSync('./server-cert.pem','utf8')
	};
*/
/*https.createServer(options,function(req,res)
	{
		res.writeHead(200);
		res.end('hello world\n');
	}).listen()*/

/// Create an HTTP server


// Imports dependencies and set up http server
const
	express=require('express'),
	bodyParse=require('body-parser'),
	app=express().use(bodyParse.json());// Creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 60312,()=>console.log('webhook is listening'));
/*let httpsServer=https.createServer(credentials,app);
let httpServer=http.createServer(app);
httpServer.listen(80,()=>console.log("http is listening"));
httpsServer.listen(60312,()=>console.log("webhook is listening"));*/

/// Add your webhook endpoint

// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {  

	// Parse the request body from the POST
	let body = req.body;

	// Check the webhook event is from a Page subscription
	if (body.object === 'page') {

		// Iterate over each entry - there may be multiple if batched
		body.entry.forEach(function(entry) {
			// Get the webhook event. entry.messaging is an array, but 
			// will only ever contain one event, so we get index 0
			let webhook_event = entry.messaging[0];
			//console.log(webhook_event); //for debugging

			// Get the sender PSID
			let sender_psid = webhook_event.sender.id;
			console.log('Sender PSID: ' + sender_psid);

			// Check if the event is a message or postback and
			// pass the event to the appropriate handler function
			if (webhook_event.message) {
				handleMessage(sender_psid, webhook_event.message);        
			} else if (webhook_event.postback) {
				handlePostback(sender_psid, webhook_event.postback);
			}
		});

		// Return a '200 OK' response to all events
		res.status(200).send('EVENT_RECEIVED');
	} else {
		// Return a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}
});

/// Add webhook verification

// Adds support for GET requests to our webhook
app.get('/webhook',(req,res)=>{
	console.log('GET EVENT');
	console.log(req);
	// Your verify token. Should be a random string.
	let VERIFY_TOKEN="fay8Qc0pcLlKudzlvwiX2vYtKHwRH8YJvMq5FsYO1axi4bRoApBCLr0hLuJTSiwS";

	// Parse the query params
	let mode=req.query['hub.mode'];
	let token=req.query['hub.verify_token'];
	let challenge=req.query['hub.challenge'];

	// Checks if a token and mode is in the query string of the request
	if(mode&&token){
		// Checks the mode and token sent is correct
		if(mode==='subscribe'&&token===VERIFY_TOKEN){
			// Responds with the challenge token from the request
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);
			//res.sendStatus(200);
		}
		else{
			// Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
		}
	}
	else{
		res.sendStatus(404);
	}
});
