var request = require('request');
var cheerio = require('cheerio');
var VCalendar = require('cozy-ical').VCalendar;
var VEvent = require('cozy-ical').VEvent;
var fs = require('fs');
 
var cal = new VCalendar({
  organization: 'University of Illinois',
  title: 'Academic Calendar'
});

var getNumberForMonth = function(month){

	switch(month.toLowerCase()){
		case "january":
			return "01";
		case "february":
			return "02";
		case "march":
			return "03";
		case "april":
			return "04";
		case "may":
			return "05";
		case "june":
			return "06";
		case "july":
			return "07";
		case "august":
			return "08";
		case "september":
			return "09";
		case "october":
			return "10";
		case "november":
			return "11";
		case "december":
			return "12";
	}

}

request("http://senate.illinois.edu/ep0944.html", function(err, res, body){

	var $ = cheerio.load(body);

	var counter = 0;

	$('tr').each(function(){

		var date = "";

		var description = "";

		if ($(this).children().length == 2){

			if ($(this).children()[0].children[0].data != undefined){

				description = $(this).children()[0].children[0].data;

			}
			else {

				description = $(this).children()[0].children[0].children[0].data;

			}

			date = $(this).children()[1].children[0].data;

			var earlierYear = $('title').text().split(" ")[1].split("-")[0];

			var laterYear = $('title').text().split(" ")[1].split("-")[1];

			var year = "";

			if (date.toLowerCase().indexOf("september") != -1 || date.toLowerCase().indexOf("october") != -1 || date.toLowerCase().indexOf("november") != -1 || date.toLowerCase().indexOf("december") != -1 || counter == 0){
				year = earlierYear;
			}
			else {
				year = laterYear;
			}

			date = date.replace("(no classes)", "");

			date = date.trim();
			
			if (date.split(",")[1] != undefined){

				day = date.split(",")[1].substring(date.split(",")[1].length - 2).replace(/ /g, "");

				day = (parseInt(day) + 1).toString();

				if (day.length == 1){

					day = "0" + day;

				}
				if (date[0] == 0){

					date = date.substring(1);

				}

				counter++;

				var vevent = new VEvent({
				  stampDate: new Date(year + "-" + getNumberForMonth(date.replace(/\s\s+/g, ' ').split(" ")[1].replace(/ /g, "")) + "-" + day + " 00:00:00"),
				  startDate: new Date(year + "-" + getNumberForMonth(date.replace(/\s\s+/g, ' ').split(" ")[1].replace(/ /g, "")) + "-" + day + " 00:00:00"),
				  endDate: new Date(year + "-" + getNumberForMonth(date.replace(/\s\s+/g, ' ').split(" ")[1].replace(/ /g, "")) + "-" + day + " 00:00:00"),
				  description: description,
				  uid: counter
				});

				cal.add(vevent);

			}

		}

	});
	
	fs.writeFileSync("uiuc.ics", cal.toString().replace(/DESCRIPTION/g, "SUMMARY"));

});