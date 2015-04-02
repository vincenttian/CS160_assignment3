//@program
var THEME = require('themes/flat/theme');
var BUTTONS = require("controls/buttons");
var CONTROL = require('mobile/control');
var KEYBOARD = require('mobile/keyboard');

deviceURL = "";

// styles
var whiteSkin = new Skin( { fill:"white" } );
var nameInputSkin = new Skin({ borders: { left:2, right:2, top:2, bottom:2 }, stroke: 'gray',});
var fieldStyle = new Style({ color: 'black', font: 'bold 18px', horizontal: 'left', vertical: 'middle', left: 3, right: 3, top: 3, bottom: 3, });
var fieldHintStyle = new Style({ color: '#aaa', font: '18px', horizontal: 'left', vertical: 'middle', left: 3, right: 3, top: 3, bottom: 3, });
var labelStyle = new Style( { font: "13px", color:"black" } );
var titleLabelStyle = new Style( { font: "20px", color:"black" } );

Handler.bind("/discover", Behavior({
	onInvoke: function(handler, message){
		deviceURL = JSON.parse(message.requestText).url;
	}
}));

Handler.bind("/forget", Behavior({
	onInvoke: function(handler, message){
		deviceURL = "";
	}
}));

// field
var myField = Container.template(function($) { return { 
	width: 150, height: 25, skin: nameInputSkin, contents: [
		Scroller($, { 
			left: 4, right: 4, top: 4, bottom: 4, active: true, 
			behavior: Object.create(CONTROL.FieldScrollerBehavior.prototype), clip: true, contents: [
				Label($, { 
					left: 0, top: 0, bottom: 0, skin: THEME.fieldLabelSkin, style: fieldStyle, anchor: 'NAME',
					editable: true, string: $.name,
				 	behavior: Object.create( CONTROL.FieldLabelBehavior.prototype, {
						// edited here
				 		onEdited: { value: function(label){
				 			var data = this.data;
							data.name = label.string;
							if (label.string == "Kevin" || label.string == "Dog1") {
								KEYBOARD.hide();
								titleLabel.focus();
								nameField.name = label.string;
								application.invoke(new Message(deviceURL + "name"), Message.JSON);
							}
							label.container.hint.visible = ( data.name.length == 0 );	
				 		}}
				 	}),
				 }),
				 Label($, {
	 			 	left:2, right:2, top:2, bottom:2, style:fieldHintStyle, string:"Tap to add name", name:"hint"
				 })
			]
		})
	]
}});
var nameField = new myField({name: ""});


Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}

// sets message depending on next feed time
function setMessage(json) {
	counterLabel.string = json.count + " hours";
	dogName = nameField['name']; 
	if (json.count < 3) {
		messageLabel.string = "Didn't " + dogName + " just eat?";
	} else if (json.count < 6) {
		messageLabel.string = "Seems just right for " + dogName + "'s appetite!";;
	} else {
		messageLabel.string = "Don't let " + dogName + " starve you fool!";
	}
	nextEatenLabel.string = new Date().addHours(json.count).toLocaleString();
}

// buttons
var foodDecreaseButton = BUTTONS.Button.template(function($){ return{
	left: 80, right: 80, height:20, top:15,
	contents: [
		new Label({left:0, right:0, height:20, string:"Decrease", style: labelStyle})
	],
	behavior: Object.create(BUTTONS.ButtonBehavior.prototype, {
		onTap: { value: function(content){
			content.invoke(new Message(deviceURL + "foodDecrease"), Message.JSON);
		}},
		onComplete: { value: function(content, message, json){
			setMessage(json);
		}}
	})
}});

var foodIncreaseButton = BUTTONS.Button.template(function($){ return{
	left: 80, right: 80, height:20, top:3,
	contents: [
		new Label({left:0, right:0, height:20, string:"Increase", style: labelStyle})
	],
	behavior: Object.create(BUTTONS.ButtonBehavior.prototype, {
		onTap: { value: function(content){
			content.invoke(new Message(deviceURL + "foodIncrease"), Message.JSON);
		}},
		onComplete: { value: function(content, message, json){
			setMessage(json);
		}}
	})
}});

var foodResetButton = BUTTONS.Button.template(function($){ return{
	left: 80, right: 80, height:20, top:3,
	contents: [
		new Label({left:0, right:0, height:20, string:"Reset", style: labelStyle})
	],
	behavior: Object.create(BUTTONS.ButtonBehavior.prototype, {
		onTap: { value: function(content){
			content.invoke(new Message(deviceURL + "foodReset"), Message.JSON);
		}},
		onComplete: { value: function(content, message, json){
			setMessage(json);
		}}
	})
}});

var changePictureButton = BUTTONS.Button.template(function($){ return{
	left: 80, right: 80, height:20, top:3,
	contents: [
		new Label({left:0, right:0, height:20, string:"Change Picture", style: labelStyle})
	],
	behavior: Object.create(BUTTONS.ButtonBehavior.prototype, {
		onTap: { value: function(content){
			content.invoke(new Message(deviceURL + "changePicture"), Message.JSON);
		}},
		onComplete: { value: function(content, message, json){
			flickr.url = json.picture;
		}}
	})
}});

var eatenButton = BUTTONS.Button.template(function($){ return{
	left: 80, right: 80, height:20,
	contents: [
		new Label({left:0, right:0, height:20, string:"Dog just ate; Update Time", style: labelStyle})
	],
	behavior: Object.create(BUTTONS.ButtonBehavior.prototype, {
		onTap: { value: function(content){
			content.invoke(new Message(deviceURL + "eaten"), Message.JSON);
		}},
		onComplete: { value: function(content, message, json){
			eatenLabel.string = json.eaten;
			nextEatenLabel.string = json.nextTime;
		}}
	})
}});

var dogWeightButton = BUTTONS.Button.template(function($){ return{
	left: 80, right: 80, height:20, top:13,
	contents: [
		new Label({left:0, right:0, height:20, string:"See Dog/Food Weights", style: labelStyle})
	],
	behavior: Object.create(BUTTONS.ButtonBehavior.prototype, {
		onTap: { value: function(content){
			content.invoke(new Message(deviceURL + "returnWeights"), Message.JSON);
		}},
		onComplete: { value: function(content, message, json){
			dogWeightLabel.string = "Dog Weight: " + json.dogWeight;
			foodWeightLabel.string = "Food Weight: " + json.foodWeight;
		}}
	})
}});

// labels
var dogWeightLabel = new Label({left:0, right:0, height:9, top:7, string:"Dog Weight: 0 pounds", style: titleLabelStyle});
var foodWeightLabel = new Label({left:0, right:0, height:9, top:7, string:"Food Weight: 0 pounds", style: titleLabelStyle});
var titleLabel = new Label({left:0, right:0, height:9, top:7, string:"Dog Caretaker Client", style: titleLabelStyle});
var dogNameLabel = new Label({left:0, right:0, height:9, top:15, string:"Dog Name", style: labelStyle});
var profilePicLabel = new Label({left:0, right:0, height:9, top:15, string:"Profile Picture", style: labelStyle}); 
var nextFeedLabel = new Label({left:0, right:0, height:9, top:15, string:"Next Feed Time:", style: labelStyle}); 
var counterLabel = new Label({left:0, right:0, height:9, top:0, string:"0 hours", style: labelStyle});
var lastEatLabel = new Label({left:0, right:0, height:9, top:15, string:"Last Time Eaten At:", style: labelStyle});
var eatenLabel = new Label({left:0, right:0, height:14, string:new Date().toLocaleString(), style: labelStyle});
var nextEatLabel = new Label({left:0, right:0, height:9, top:13, string:"Next Time To Feed:", style: labelStyle});
var nextEatenLabel = new Label({left:0, right:0, height:14, string:new Date().toLocaleString(), style: labelStyle});
var messageLabel = new Label({left:0, right:0, height:9, top:8, string:"Set up the next meal time!", style: labelStyle});

// image
var flickr = new Picture({right:0, left:0, top:3, height: 35, width: 100}, "https://farm9.staticflickr.com/8717/16963130376_ff529b589b_m.jpg");

// main app
var mainColumn = new Column({
	left: 0, right: 0, top: 0, bottom: 0, active: true, skin: whiteSkin,
	contents: [
		titleLabel,
		dogNameLabel,
		nameField,
		profilePicLabel,
		flickr,
		new changePictureButton(),
		lastEatLabel,
		eatenLabel,
		new eatenButton(),
		nextFeedLabel,
		counterLabel,
		messageLabel,
		new foodDecreaseButton(),
		new foodIncreaseButton(),
		new foodResetButton(),
		nextEatLabel,
		nextEatenLabel,
		dogWeightButton(),
		dogWeightLabel,
		foodWeightLabel
	]
});

var ApplicationBehavior = Behavior.template({
	onDisplayed: function(application) {
		application.discover("vtianpetdevice");
	},
	onQuit: function(application) {
		application.forget("vtianpetdevice");
	},
})

application.behavior = new ApplicationBehavior();
application.add(mainColumn);