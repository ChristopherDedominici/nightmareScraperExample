"use strict";
var Nightmare = require('nightmare');
var figlet = require('figlet');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/databaseFiles';
var companiesInfoVet = [];
var nightmare = new Nightmare({
	show: true,
	webPreferences: {
		images: false,
	},
});

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
	
	var url = "https://www.elite-growth.com/en/companies/elite";
	var busy = false;
	var oldDocumentHeight = 0;

	nightmare
	.viewport(800, 600)
	.goto(url)
	.wait(".pager-next a")	
	.then(function(){

		var scrollIntervalTimeId = setInterval(function(){ 

			if(!busy){ 
				busy = true;
				
				nightmare
				.evaluate(function(){

					return document.body.scrollHeight;
				})
				.then(function(documentHeight){
					
					if(documentHeight === oldDocumentHeight){
						clearInterval(scrollIntervalTimeId);
						console.log("\nScrolling ended\n");
						dowloadCompaniesLinks();

					} else{
						oldDocumentHeight = documentHeight;
						console.log("..scrolling to document height " + documentHeight);

						nightmare
						.scrollTo(documentHeight, 0)
						//wait for current scroll to finish
						.wait(function(){
							var scrolledDone = document.querySelector('#views_infinite_scroll-ajax-loader');
							if(scrolledDone === null){
								return true;
							} else{
								return false;	
							}
						})
						.then(function(){
							busy = false;	
						});
					}
				});
			}		
		}, 50);
	});
}

function dowloadCompaniesLinks(){

	nightmare
	.evaluate(function(){
		var companiesLinksObj = document.querySelectorAll(".info .node__title a");
		var companiesLinks = [];
		
		for(var i=0, l = companiesLinksObj.length; i<l; i++){
			companiesLinks[i] = companiesLinksObj[i].href;
		}

		return companiesLinks;
	})
	.end()
	.then(function(companiesLinks){

		console.log("there are " + companiesLinks.length + "companies");

		var index = 0;
		var downloaded = 0;
		var maxRunningInstances = 5;
		var runningInstances = 0;
		var nightmareMultipleInstances = [];
		var freeInstanceIndex = [];

		for(var i=0; i<maxRunningInstances; i++){
			nightmareMultipleInstances[i] = new Nightmare({
				show: true,
				webPreferences: {
					images: false,
				}
			});
			freeInstanceIndex[i] = i;
		}

		var scrapeInfoTimeId = setInterval(function(){
	
			if(downloaded === companiesLinks.length){
				clearInterval(scrapeInfoTimeId);

				for(var i=0; i<maxRunningInstances; i++){
					nightmareMultipleInstances[i]
					.end();
				}

				console.log("scraping is finished");
				addCompaniesToDB();
				process.kill(process.pid);
				
			}

			if(index < companiesLinks.length && runningInstances < maxRunningInstances){
				runningInstances++;	
				console.log(index + "/" + companiesLinks.length + " getting info from link " + companiesLinks[index]);			
							
				var instance  = freeInstanceIndex.pop();	
				var id = index;		
				nightmareMultipleInstances[instance]
				.goto(companiesLinks[index++])
				.wait(".l-region--sidebar-second")
				.evaluate(function(){

					var name = "";
					var region = "";
					var sector = "";
					var country = "";
					var industry = "";

					if(document.getElementById("page-title") !== null){
						name = document.getElementById("page-title").innerText;
					}
					if(document.querySelector(".field--name-field-cmp-gnr-info-region .field-items") !== null){
						region = document.querySelector(".field--name-field-cmp-gnr-info-region .field-items").innerText;
					}	
					if(document.querySelector(".field--name-field-cmp-gnr-info-sector .field-items") !== null){
						sector = document.querySelector(".field--name-field-cmp-gnr-info-sector .field-items").innerText;
					}
					if(document.querySelector(".field--name-field-cmp-gnr-info-country .field-items") !== null){
						country = document.querySelector(".field--name-field-cmp-gnr-info-country .field-items").innerText;
					}
					if(document.querySelector(".field--name-field-cmp-gnr-info-industry .field-items") !== null){
						industry = document.querySelector(".field--name-field-cmp-gnr-info-industry .field-items").innerText;
					}

					var companyInfo = {
						name : name,
						region : region,
						sector : sector,
						country: country,
						industry: industry
					};

					return companyInfo;
				})
				.then(function(companyInfo){
					
					companyInfo._id = id;
					companiesInfoVet.push(companyInfo);
					
					downloaded++;
					runningInstances--;
					freeInstanceIndex.push(instance);
				})
				.catch(function(error){
					console.log(error);
					var brokenLink = id;
					console.log("probably the URL is broken: " + companiesLinks[brokenLink]);
					downloaded++;
					runningInstances--;
					freeInstanceIndex.push(instance);
				});			
			}

		}, 100);
	});
}

function addCompaniesToDB(){
	
	console.log("adding information to mongoDB");

	MongoClient.connect(url, function(err, db) {

		console.log("Connected correctly to server");

		var collection = db.collection('companies');

		collection.insertMany(companiesInfoVet, function(err) {
			
			if(err){
				db.close();
				throw err;
			}
			console.log("Inserted all companies into the database");
			db.close();
		});
	});	
}


	

	
