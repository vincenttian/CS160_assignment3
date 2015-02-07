var THEME = require('themes/flat/theme');
var BUTTONS = require('controls/buttons');

// Styling
var greyS = new Skin({fill:"grey"});
var whiteS = new Skin({fill:"white"});
var titleLabelStyle = new Style( { font: "bold 25px", color:"white", height: "20px" } );
var regLabelStyle = new Style( { font: "20px", color:"white", height: "10px" } );
var smallLabelStyle = new Style( { font: "15px", color:"white", height: "10px" } );

// labels
var titleLabel = new Label({left:10, right:10, top: 10, string: "XKCD Reader", style: titleLabelStyle});
var numLabel = new Label({left:5, top: 100, string: "", style: smallLabelStyle});
var xkcdTitleLabel = new Label({left:5, top: 120, string: "Title", style: regLabelStyle});

// pictures
var comic = new Picture({left: 0, right: 0, top:160, height: 310}, "http://imgs.xkcd.com/comics/barrel_cropped_(1).jpg");
var flickr = new Picture({right: 5, top:100, height: 50, width: 100}, "http://farm8.staticflickr.com/7421/16461707702_2ea36b4b4e_m.jpg");

// app logic
var comic;
var flickr;

var curr = 1;

function next() {
    if (curr == 614) {
    	curr = 1;
    	return curr;
    } else {
    	curr += 1;
    	return curr;
    }
}

function prev() {
    if (curr == 1) {
    	curr = 614;
    	return curr;
    } else {
    	curr -= 1;
    	return curr;
    }
}

function random() {
	curr = Math.floor((Math.random() * 614) + 1);
	return curr; 
}

function getURL(num) {
	return "http://xkcd.com/" + num + "/info.0.json";
}

// API
var flickerURL = "http://api.flickr.com/services/feeds/photos_public.gne?format=json&tags=";
var xkcdURL = "http://xkcd.com/1/info.0.json";
var tag = "barrel";

function getPictures(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    links = [];
    text.replace(urlRegex, function(url) {
        var index = url.indexOf(".jpg"); 
        if (index > -1) { 
        	links.push(url.substring(0, 63));
        }
    })
    return links;
}

// buttons
var nextButtonBehavior = function(content, data){
	BUTTONS.ButtonBehavior.call(this, content, data);
}
nextButtonBehavior.prototype = Object.create(BUTTONS.ButtonBehavior.prototype, {
	onTap: { value:  function(application, button){
		xkcdURL = getURL(next());
		application.invoke(new Message("/getXKCD"));
	}}
});
var nextButtonTemplate = BUTTONS.Button.template(function($){ return{
	top:45, left:123, width:75, height: 30,
	contents:[
		new Label({left:0, right:0, height:15, string:$.textForLabel, style: regLabelStyle})
	],
	behavior: new nextButtonBehavior
}});
var nextButton = new nextButtonTemplate({textForLabel:"Next"});

var prevButtonBehavior = function(content, data){
	BUTTONS.ButtonBehavior.call(this, content, data);
}
prevButtonBehavior.prototype = Object.create(BUTTONS.ButtonBehavior.prototype, {
	onTap: { value:  function(application, button){
		xkcdURL = getURL(prev());
		application.invoke(new Message("/getXKCD"));
	}}
});
var prevButtonTemplate = BUTTONS.Button.template(function($){ return{
	top:45, left:20, width:75, height: 30,
	contents:[
		new Label({left:0, right:0, height:15, string:$.textForLabel, style: regLabelStyle})
	],
	behavior: new prevButtonBehavior
}});
var prevButton = new prevButtonTemplate({textForLabel:"Prev"});

var randButtonBehavior = function(content, data){
	BUTTONS.ButtonBehavior.call(this, content, data);
}
randButtonBehavior.prototype = Object.create(BUTTONS.ButtonBehavior.prototype, {
	onTap: { value:  function(application, button){
		xkcdURL = getURL(random());
		application.invoke(new Message("/getXKCD"));
	}}
});
var randButtonTemplate = BUTTONS.Button.template(function($){ return{
	top:45, right:20, width: 75, height: 30,
	contents:[
		new Label({left:0, right:0, height:15, string:$.textForLabel, style: regLabelStyle})
	],
	behavior: new randButtonBehavior
}});
var randButton = new randButtonTemplate({textForLabel:"Rand"});

// main app
Handler.bind("/getFlickr", {
	onInvoke: function(handler, message){
		handler.invoke(new Message(flickerURL + tag), Message.TEXT);
	},
	onComplete: function(handler, message, flickrData){
		stringData = flickrData.substring(15, flickrData.length - 1);
		pictures = getPictures(stringData);
		flickr.url = pictures[0];
	}
});

Handler.bind("/getXKCD", {
	onInvoke: function(handler, message){
		handler.invoke(new Message(xkcdURL), Message.JSON);
	},
	onComplete: function(handler, message, data){
		comic.url = data.img;
		xkcdTitleLabel.string = data.title;
		tag = data.title;
		numLabel.string = "Comic #" + data.num;
		application.invoke(new Message("/getFlickr"));
	}
});

application.behavior = Object.create(Behavior.prototype, {
	onLaunch: { value: function(application, data){
		application.invoke(new Message("/getXKCD"));
	}}
});

// Add things to application
var mainCon = new Container({left:0, right:0, top:0, bottom:0, skin: greyS});
application.add(mainCon);
mainCon.add(titleLabel);
mainCon.add(numLabel);
mainCon.add(xkcdTitleLabel);
mainCon.add(nextButton);
mainCon.add(prevButton);
mainCon.add(randButton);
mainCon.add(comic);
mainCon.add(flickr);