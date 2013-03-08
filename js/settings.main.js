$(document).ready(function(){
	//on add button click
	$("#browse-button").click(function(e){
		e.preventDefault();
		//get value of input field
		$("#add-input").blur();
		//insert value into variable
		var r=$("#add-input").val();
		//store into data object to display it
		var subredditName = chameleon.getData();
		subredditName.subreddit = r;
		chameleon.saveData(subredditName);
		chameleon.close(true);
	});

});