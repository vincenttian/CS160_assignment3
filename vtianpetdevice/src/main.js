//@program
var whiteSkin = new Skin( { fill:"white" } );
var labelStyle = new Style( { font: "13px", color:"black" } );
var titleLabelStyle = new Style( { font: "20px", color:"black" } );

Handler.bind("/foodIncrease", Behavior({
	onInvoke: function(handler, message){
		count++;
		if (count == 0) {
			message.responseText = JSON.stringify( { count: "0" } );
			counterLabel.string = "0 hours";
		}
		else {
			message.responseText = JSON.stringify( { count: count } );
			counterLabel.string = count + "hours";
		}
		message.status = 200;
	},
}));

Handler.bind("/foodDecrease", Behavior({
	onInvoke: function(handler, message){
		count--;
		if (count == 0) {
			message.responseText = JSON.stringify( { count: "0" } );
			counterLabel.string = "0 hours";
		}
		else {
			message.responseText = JSON.stringify( { count: count } );
			counterLabel.string = count + "hours";
		}
		message.status = 200;
	}
}));

Handler.bind("/foodReset", Behavior({
	onInvoke: function(handler, message){
		count = 0;
		counterLabel.string = "0 hours";
		message.responseText = JSON.stringify( { count: "0" } );
		message.status = 200;
	}
}));

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}

Handler.bind("/eaten", Behavior({
	onInvoke: function(handler, message){
		curEatTime = new Date()
		eaten = curEatTime.toLocaleString();
		eatenLabel.string = eaten;
		nextEat = curEatTime.addHours(count).toLocaleString();
		nextEatenLabel.string = nextEat;
		message.responseText = JSON.stringify( { eaten: eaten, nextTime: nextEat } );
		message.status = 200;
	}
}));

Handler.bind("/name", Behavior({
	onInvoke: function(handler, message){
		name = "Dog1";
		dogNameLabel.string = name;
	}
}));

// flickr api images
var flickerURL = "http://api.flickr.com/services/feeds/photos_public.gne?format=json&tags=";
var flickr = new Picture({right: 0, left:0, top:0, height: 45, width: 100}, "https://farm9.staticflickr.com/8717/16963130376_ff529b589b_m.jpg");

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

Handler.bind("/changePicture", {
	onInvoke: function(handler, message){
		handler.invoke(new Message(flickerURL + "runningdog"), Message.TEXT);
		message.responseText = JSON.stringify( { picture: nextPic } );
		message.status = 200;
	},
	onComplete: function(handler, message, flickrData){
		stringData = flickrData.substring(15, flickrData.length - 1);
		pictures = getPictures(stringData);
		flickr.url = nextPic;
		nextPic = pictures[Math.floor(Math.random()*pictures.length)];
	}
});

name = "";
count = 0;
eaten = new Date().toLocaleString();
curEatTime = new Date();
nextPic = "https://farm8.staticflickr.com/7651/16870873176_68b17a1cd7_m.jpg";

// device simulator
var dogWeightLabel = new Label({ left:0, right:0, top:180, height:20, style:labelStyle, string:"Dog Weight" }),

var Screen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, skin: new Skin({ fill: "#fff" }),
	contents: [
		Label($, { anchor:"weightLevel", left:0, right:0, top:60, bottom:0, style:labelStyle }),
		dogWeightLabel
	]
}});

var model = application.behavior = Object.create(Object.prototype, {
	onQuit: function(application) {
		application.shared = false;
	},
	onLaunch: { value: function(application) {
		application.shared = true;
        var message = new MessageWithObject("pins:configure", {
            device: {
                require: "device",
                pins: {
                    x: {pin: 62}
                }
            }
        });
        application.invoke(message);
        application.invoke(new MessageWithObject("pins:/device/read?repeat=on&callback=/weight&interval=500"));
		this.data = { counter: 0 };
		var mainColumn = new Column({
			left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
			contents: [
				titleLabel,
				feedTimeLabel,
				counterLabel,
				lastEatLabel,
				eatenLabel,
				nextEatLabel,
				nextEatenLabel,
				profilePicLabel,
				nameLabel,
				dogNameLabel,
				flickr,
				new Screen(this.data),
				weightLabel,
				foodLabel
			]
		});
		application.add(mainColumn);
	}},
});

Handler.bind("/weight", {
	onInvoke: function(handler, message) {
		var data = model.data;
		var it = message.requestObject;
        var weight = it.x;
        var food = it.y;
        if (weight) {
        	weightLabel.string = Math.round(weight) + " pounds";
        }
        else {
        	weightLabel.string = "0 pounds";
        }
        if (food) {
        	foodLabel.string = Math.round(food) + " pounds";
        }
        else {
        	foodLabel.string = "0 pounds";
        }
	}
});

Handler.bind("/returnWeights", {
	onInvoke: function(handler, message) {
		message.responseText = JSON.stringify( { dogWeight: weightLabel.string, foodWeight: foodLabel.string } );
		message.status = 200;
	}
});

var foodLabel = new Label({left:0, right:0, height:10, bottom:7, string:"0 lb", style: titleLabelStyle});
var weightLabel = new Label({left:0, right:0, height:10, bottom:7, string:"60 lb", style: titleLabelStyle});
var titleLabel = new Label({left:0, right:0, height:10, bottom:7, string:"Dog Caretaker Server", style: titleLabelStyle});
var feedTimeLabel = new Label({left:0, right:0, height:10, bottom:0, string:"Next Feed Time:", style: labelStyle});
var counterLabel = new Label({left:0, right:0, height: 10, bottom: 7, string:"0 hours", style: labelStyle});
var lastEatLabel = new Label({left:0, right:0, height:10, bottom:0, string:"Last Time Eaten At:", style: labelStyle});
var eatenLabel = new Label({left:0, right:0, height:10, bottom: 7, string:eaten, style: labelStyle});
var nextEatLabel = new Label({left:0, right:0, height:10, bottom:0, string:"Next Time To Feed:", style: labelStyle});
var nextEatenLabel = new Label({left:0, right:0, height:10, bottom:7, string:new Date().toLocaleString(), style: labelStyle});
var profilePicLabel = new Label({left:0, right:0, height:10, string:"Dog Profile Picture:", style: labelStyle});
var nameLabel = new Label({left:0, right:0, height:10, string:"Dog Name:", style: labelStyle});  
var dogNameLabel = new Label({left:0, right:0, height:10, string:"Unnamed", style: labelStyle}); 


