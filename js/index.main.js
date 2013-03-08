$(document).ready(function(){
	/*
		- Initialize Chameleon Lifecycle
		- All callback functions are optional.
			- If you are not using a callback, remove it for extra preformance.
	*/
	var REFRESH_FEED_TIMESPAN=60000*5;
	var current_subreddit=null;

	chameleon.widget({	
						
						//Triggered every time the widget loads.
						onLoad:function() {	
							if(!loadSavedSubreddit())applyDefaultWelcomeContent();	
							//applyDefaultWelcomeContent();						
							//$("#chameleon-widget").html("This is Chris's Reddit Widget");		
						},
						
						//Triggered the first time the widget is created.
						onCreate:function()	{	
							//get the subreddit
							clearDisplayArea();
							if(!loadSavedSubreddit())applyDefaultWelcomeContent();
							//applyDefaultWelcomeContent();
						},
						
						//Triggered everytime Chameleon resumes	(comes back into focus).				
						onResume:function() {
							//
							if(current_subreddit!=null){
								startPolling();
							}
						},
						
						//Triggered every time Chameleon pauses (goes out of focus).
						onPause:function() {
							//
						},
						
						//Triggered every time the size of the widget changes.
						onLayout:function()	{
							//	
						},
						
						//Triggered when the user scrolls the widget to it's top.
						onScrollTop:function() {
							//
						},
						
						//Triggered when the user scrolls the widget away from it's top.
						onScrollElsewhere:function() {
							//
							stopPolling();
						},
						
						//Triggered when the user enters dashboard edit mode.
						onLayoutModeStart:function() {
							//					
							
						},
						
						//Triggered when the user exits dashboard edit mode.
						onLayoutModeComplete:function() {
							//
							if(current_subreddit!=null){
								startPolling();
							}else{
								applyDefaultWelcomeContent();
							}
						},
						
						//Triggered when the status of network availability changes.
						onConnectionAvailableChanged:function(available) {
							//
						},
						
						//Triggered when the user taps the configure button in the widget title bar.
						onConfigure:function() {
							stopPolling();
							launchSettings();						
						},
						
						
						//Triggered when the user taps the widget titlebar.
						onTitleBar:function() {
							//
						},
						
						//Triggered when the user taps the refresh button on the widget title bar.
						onRefresh:function() {
							//
							clearDisplayArea();
							getSubReddit();
						},
						
						
						//Triggered when the user taps the action button on the widget title bar.
						onAction:function()	{
							//							
						},
						
						//Triggered every time the widget loads, but not in Chameleon.				
						notChameleon:function()	{
							$("#chameleon-widget").html("This is a template for building widgets");	
						},
						
					}
	);	
	function loadSavedSubreddit()	{
		clearDisplayArea();
		var r=false;
		
		var inst_data=chameleon.getData();
		if(inst_data==null)inst_data={};
		
		if(inst_data.subreddit!=null){
			current_subreddit=inst_data.subreddit;
			getSubReddit(current_subreddit);
			r=true;
		}else{
			applyDefaultWelcomeContent();
		}				
		return r;
	}

	function getSubReddit(subreddit){
		//the ajax call to return the json data
		var subredditName = chameleon.getData();
		subreddit = subredditName.subreddit;
		if(subreddit != null){;
			$.ajax({
				type: "GET",
				dataType: "jsonp",
				url: "http://www.reddit.com/r/" + subreddit + "/.json",
				error: function(xhr, status){
					startPolling();
		      		chameleon.showLoading({showloader:false});
		      		chameleon.initialize();
				},
				success: function(data){	
					if(subreddit === "all"){
						chameleon.setTitle({text:"browsing /r/all"});
					}else{
						chameleon.setTitle({text:"browsing /r/" + data.data.children[0].data.subreddit});	
					}
					var count = 0;
					$.each(data.data.children, function(i, item){
						count ++;
						if(item.data.thumbnail != "default" && item.data.over_18 != true && item.data.thumbnail != "" && item.data.thumbnail !="self"){					
							$('#chameleon-widget').append('<div class="wrapper"><span class="rank">' + count + '.</span><img src="' + item.data.thumbnail + '"/><a href="' + item.data.url + '">' + item.data.title + '</a> <span class="domain">(' + item.data.domain + ')</span></div>');
						}else if(item.data.thumbnail == ""){
							$('#chameleon-widget').append('<div class="wrapper"><span class="rank">' + count + '.</span><a href="' + item.data.url + '">' + item.data.title + '</a> <span class="domain">(' + item.data.domain + ')</span></div>');
						}else if(item.data.over_18 == true){
							$('#chameleon-widget').append('<div class="wrapper"><span class="rank">' + count + '.</span><img src="./images/nsfw.png"/><a href="' + item.data.url + '">' + item.data.title + '</a> <span class="domain">(' + item.data.domain + ')</span></div>');
						}else if(item.data.thumbnail == "self"){
							$('#chameleon-widget').append('<div class="wrapper"><span class="rank">' + count + '.</span><img src="./images/self.png"/><a href="' + item.data.url + '">' + item.data.title + '</a> <span class="domain">(' + item.data.domain + ')</span></div>');
						}else{
							$('#chameleon-widget').append('<div class="wrapper"><span class="rank">' + count + '.</span><a href="' + item.data.url + '">' + item.data.title + '</a> <span class="domain">(' + item.data.domain + ')</span></div>');
						}
					})
					$("#chameleon-widget").chameleonProxyAllLinks();
					startPolling();
				},
				jsonp: "jsonp"
			});
		}else{
			launchSettings();
		}
	}

	function clearDisplayArea(){
		$("#chameleon-widget").html("");
	}

	function applyDefaultWelcomeContent()	{
		if(chameleon.connected()){
			$("#chameleon-widget").chameleonWidgetConfigureHTML({
				onConfigure:launchSettings,
				title: "Welcome",
				caption: "Please tap here to enter a subreddit you wish to browse"
			});

		}else{
			applyNoNetwork();
		}
		chameleon.initialize();
	}

	function launchSettings(e)	{
		if(e!=null)e.preventDefault();
		chameleon.promptHTML({
				url:"settings.html",
				callback:function(success,data){
					if(success){
						if(!loadSavedSubreddit())applyDefaultWelcomeContent();
					}else{
						if(current_subreddit==null)applyDefaultWelcomeContent();
					}	
				}
			});	
	}

	function applyNoNetwork()	{
		$("#chameleon-widget").chameleonWidgetNeedWiFiHTML();
	}

	function startPolling() {
		chameleon.poll({id:"feed_refresh",action:"start",interval:REFRESH_FEED_TIMESPAN,callback:getSubReddit});
	}
	
	function stopPolling() {
		chameleon.poll({id:"feed_refresh",action:"stop"});
	}

});