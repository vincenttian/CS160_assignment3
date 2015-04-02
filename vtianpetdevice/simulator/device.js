var PinsSimulators = require('PinsSimulators');

exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
			header : { 
				label : "Dog Weight", 
				name : "device", 
				iconVariant : PinsSimulators.SENSOR_MODULE 
			},
			axes : [
				new PinsSimulators.AnalogInputAxisDescription(
					{
						valueLabel : "Dog Weight",
						valueID : "x",
						speed : 0,
						minValue: 0,
						maxValue: 100,
						defaultControl: PinsSimulators.SLIDER
					}
				),
				new PinsSimulators.AnalogInputAxisDescription(
					{
						valueLabel : "Amount Food",
						valueID : "y",
						speed : 0,
						minValue: 0,
						maxValue: 10,
						defaultControl: PinsSimulators.SLIDER
					}
				),
			]
		});
}

exports.close = function() {
	shell.delegate("removeSimulatorPart", this.pinsSimulator);
}

exports.read = function() {
	return this.pinsSimulator.delegate("getValue");
}

exports.pins = {
			x: { type: "A2D" },
			y: { type: "A2D" }
		};