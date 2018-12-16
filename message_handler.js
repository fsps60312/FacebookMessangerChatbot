'use strict';
const {spawnSync} = require('child_process');
module.exports={
	get_response_text: function(sender_psid,message){
		const result=spawnSync('./dotnet/dotnet',[
			'dotnet/code/message_handler.dll',
			sender_psid,
			message
		]);
		if(result.err)return `Error: ${result.err}`;
		else return result.stdout;
	}
};
