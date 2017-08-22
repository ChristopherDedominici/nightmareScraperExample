# Nightmare.js Scraper Example

<br>

<img src="screenshot/scrollingPage.png" style="width:100%; height:100%;"/>


<br>

### Description

This is an example on how to use Nightmare.js to scrape websites.

<br>

There are two version:

###NEW VERSION = nightmareScraper.js
The scraper scrolls until the end of the document, gets all companies links and then dowload all the information.

**HOW IT WORKS:**

1. The scraper recursively scroll until the end of the document.
2. Then it collects all the companies link.
3. Finally it downloads all the information and store them inside MongoDB.

The recursive scroll action is done using only one Nightmare instance while the information are downloaded using 6 parallel Nightmare instances. 

<img src="screenshot/downloadInfo.png" style="width:100%; height:100%;"/>

<br>

###OLD VERSION = nightmareScraper.OLD.js
The scraper scrolls until the end of the document recursively clicking on the button "load more companies" and then it downloads all the companies logo images.


**HOW IT WORKS:**

 1. The scraper open a url and recursively clicks a button to load more information until it reaches the end of the document.

2. Then It downloads all the companies logos using the npm package [image-downloader](https://www.npmjs.com/package/image-downloader) and save them inside the folder "images".
	
**N.B:** this version is no longer working because the website has changed it's structure. There is no longer the "load more companies" button.
I have left this version available to give an example on how to recursively click on a button using Nightmare.js
 
<br>

 **I have also included a script called "readDB.js" that can be  use to print all the companies info.** 


 

 
 
