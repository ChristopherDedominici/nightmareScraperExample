"use strict";
var Nightmare = require('nightmare');
var download = require('image-downloader')
var figlet = require('figlet');
 

figlet.text('  Nightmare Scraper  ', {
	font: 'Bloody',
	horizontalLayout: 'default',
	verticalLayout: 'default'
}, function(err, data) {
	if (err) {
		console.log('Something went wrong...');
		console.dir(err);
		return;
	}

	console.log("\n\n" + data);
	console.log("\n\nReady to SCRAPE\n\n");

	callNightmare();	
});


function callNightmare(){ 
	
	var nightmare = new Nightmare({
		show: true,
		webPreferences: {
			images: false,
		},
	});

	var url = "https://www.elite-growth.com/en/companies/elite";

	nightmare
		.viewport(800, 600)
		.goto(url)
		.wait(".pager-next a")	
		.then(function(){

			var btnInterval = setInterval(
				function(){ 
					nightmare
						.evaluate(function(){

							var nextButton = document.querySelector(".pager-next a");
							
							if(nextButton === null){
								if(document.querySelector(".ajax-progress .throbber") === null){
									return true; 
								} else{
									return false;
								}
							} else{
								nextButton.click();
								return false;
							}

						})
						.then(function(goOn){
							
							if(goOn === true){
								
								clearInterval(btnInterval);

								console.log("\nScrolling ended\n");

								nightmare
									.evaluate(function(){
										var imgObjs = document.querySelectorAll(".picture img");
										var imgLinks = [];
										
										for(var i=0, l = imgObjs.length; i<l; i++){
											imgLinks[i] = imgObjs[i].src;
										}

										return imgLinks;
									})
									.then(function(linksToSCrape){
										dowlwoadImages(linksToSCrape);
									});
							} else{
								console.log("..scrolling..");
							}
						});
				},			
			150);
		});
}

function dowlwoadImages(linksToSCrape){
	
	var imgsOptions = [];
	var d;
	
	console.log("\nAll images link downloaded, ready to download images\n");
	console.log("..starting..\n");

	for(var i=0, l=linksToSCrape.length; i< l; i++){
		
		d = "images/photo_n_" + i + ".jpg";
		imgsOptions[i] = {
			url : linksToSCrape[i],
		  	dest: d
		};
	}

	i = 0;
	l=linksToSCrape.length;

	var dowloadTimeId = setInterval(function(){

		if(i <l){
			console.log((i+1) + " of " + l + " images. Link: " + imgsOptions[i].url);
			download.image(imgsOptions[i])
			.catch((err) => {
				throw err;
			});

			i++;		
		} else{
			clearInterval(dowloadTimeId);
			setTimeout(function(){
				process.kill(process.pid);
			}, 2000);
		}
	},10);
}



	
