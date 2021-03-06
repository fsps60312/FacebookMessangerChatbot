'use strict';
const {spawnSync} = require('child_process');
module.exports={
	get_response_text: function(page_access_token,sender_psid,message){
		const result=spawnSync('/home/bot/.dotnet/dotnet',[
			'dotnet/code/message_handler.dll',
			page_access_token,
			sender_psid,
			message
		]);
		console.log('pid:',String(result.pid));
		console.log('error:',result.error);
		console.log('stderr:',String(result.stderr));
		console.log('stdout:',String(result.stdout));
//        if(result.err)return `Error: ${result.err}`;
//        else return String(result.stdout);// Must use "String()" or bot won't work
	}
};
