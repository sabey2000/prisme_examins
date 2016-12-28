// -----------------------------------------------------------------------------------------------------
// Casper check parameter

if ((casper.cli.args.length != 1) || (Object.keys(casper.cli.options).length != 5) || !(casper.cli.has("numpers")) || (casper.cli.get('numpers') === "") || !(casper.cli.has("code")) || (casper.cli.get('code') === "") || !(casper.cli.has("env")) || (casper.cli.get('env') === "")) {
	casper.echo("Besoin du code permanent de la personne et du numéro personne et de l'environnement (ex.: PP2, UAT, PP38, ...) : " + casper.cli.get(0) + " --numpers=<number> --code=<code> --env=<environnement>").exit();
}
2

/*
id=numPermis n'existe pas  comme pour 2999999

*/
// Global variables

var URL = "https://prisme-" + casper.cli.get('env') + ".oiiq.org"
var passwdURL = "http://http://oiiqwebpp5:3000"
var myNumPers = casper.cli.get('numpers')
var myCodePerm = casper.cli.get('code')
var myPassword = "12345"
var beforeNumber = ""
var myLanguage = "FR"
var mySite = "Montreal"
var myAccommodation = "NO"

// Casper init
casper.options.verbose = false;
casper.options.logLevel = "debug";
//casper.options.stepTimeout = 3 * 60 * 1000; //default stepTimeout is 3 minutes.
casper.options.timeout = 30000;
casper.options.waitTimeout = 30000;
casper.options.viewportSize = {
	width: 1600,
	height: 2000
};

// Simulate Chrome browser
casper.userAgent('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36');

var today = new Date();
console.log("Test d'une inscription à l'examen sur [" + URL + "] pour [" + myNumPers + "] / [" + myCodePerm + "] le " + today.toString());

// -----------------------------------------------------------------------------------------------------

casper.options.onTimeout = function() {
	this.capture('capture/failed-testtimeout-' + myNumPers + '.png');
	console.log("FATAL :: Global script timeout, please check capture/failed-testtimeout-'+myNumPers+'.png");
	casper.exit(1);
};

casper.options.onDie = function() {
	this.capture('capture/failed-testdie-' + myNumPers + '.png');
	console.log("DIE :: Global script DIE, please check capture/failed-testdie-'+myNumPers+'.png");
	casper.exit(1);
};

// -----------------------------------------------------------------------------------------------------

casper.test.begin("Test d'inscription à l'examen", 0, function(test) {
	casper.start(URL);

	casper.then(function() { // Step 1.0 - Log sur le site
		console.log("Step 1.0 - Log sur le site");
		var sectionid="login"
		casper.waitForSelector('button#Continue', 
		function then() {
			this.capture('capture/ok-getloginpage-' + myNumPers + '.png');
			this.fillSelectors('form.pivForm', {
				'input.pivTextBox': myCodePerm,
				'input.pivPassword': myPassword
			});
			this.click('input#v');
			this.capture('capture/ok-'+sectionid+'-' + myNumPers + '.png');
			this.click('button#Continue');
			casper.waitWhileVisible('#loadingMsg',function() {},function() {test.fail("Waitoff timeout");});
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});

	casper.then(function() { // Step 2.0 - Accès au dossier
		console.log("Step 2.0 - Accès au dossier");
		var sectionid="accessfile"
		casper.waitForSelector('ul.navPad li:nth-child(2) a', 
		function then() {
			this.capture('capture/ok-'+sectionid+'-' + myNumPers + '.png');
			this.click('ul.navPad li:nth-child(2) a');
			casper.waitWhileVisible('#loadingMsg',function() {},function() {test.fail("Waitoff timeout");});
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});
	
	casper.then(function() { // Step 2.1 - Modifie le numéro de téléphone principal
		console.log("Step 2.1 - Modifie le numéro de téléphone principal");
		var sectionid="changemainphone"
		casper.waitForSelector('div#decisionTitle', 
		function then() {
			var curPhone = this.fetchText('input#v8000000000000588');
			var newPnone = Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000;
			this.fillSelectors('form[id*="00247"]', {
				'input#v8000000000000588': newPnone
			});
			phoneValue = this.fetchText('input#v8000000000000588');
			this.fillSelectors('form[id*="00247"]', {
				'input[name=confirmId]': true
			});
			console.log("Avant:[" + curPhone.trim() + "], Après:[" + phoneValue.trim() + "]");
			this.fillSelectors('form[id*="00248"]', {
				'input[name=GSFT_Offense_Criminal][value*="Non"]': true,
				'input[name=GSFT_Offense_Disciplinary][value*="Non"]': true,
				'input[name=GSFT_Offense_Penal][value*="Non"]': true,
			});
			this.capture('capture/ok-'+sectionid+'-' + myNumPers + '.png');
			this.click('button#saveIdentification');
			casper.waitUntilVisible('body > div.k-widget.k-window.k-window-titleless > div > div.text-center > button', function() {
				this.click('body > div.k-widget.k-window.k-window-titleless > div > div.text-center > button');
			},function() {
				this.capture('capture/fail-confirm'+sectionid+'-' + myNumPers + '.png');
			})
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});

	casper.then(function() { // Step 3.0 - Début de l'inscription à l'examen
		console.log("Step 3.0 - Début de l'inscription à l'examen");
		var sectionid="accessexamins"
		casper.waitForSelector('ul.navPad li:nth-child(4) a', 
		function then() {
			this.capture('capture/ok-'+sectionid+'-' + myNumPers + '.png');
			test.assertEquals(this.fetchText('ul.navPad li:nth-child(4) a').trim(), "Inscription examen mars 2017","Le champ inscription est là");
			this.click('ul.navPad li:nth-child(4) a');
			casper.waitWhileVisible('#loadingMsg',function() {},function() {test.fail("Waitoff timeout");});
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});

	casper.then(function() { // Step 3.1 - Traite le popup si déjà inscrit
		console.log("Step 3.1 - Traite le popup si déjà inscrit");
		if (casper.exists("body > div.k-widget.k-window.k-window-titleless > div")) {
			console.log("C'est une réinscription");
			var info = casper.getElementsInfo("body > div.k-widget.k-window.k-window-titleless > div");
			if (info[0].visible) {
				this.click("body > div.k-widget.k-window.k-window-titleless > div > div.text-center > #btn_Inscription")
			} else {
				console.log("Probleme, je ne vois pas le popup de réinscription")
			}
		} else {
			console.log("Nouvelle inscription")
		}
	});

	casper.then(function() { // Step 3.2 - Confirmer l'identification
		console.log("Step 3.2 - Confirmer l'identification");
		var sectionid="confirmid"
		casper.waitForSelector('#validateCoordonne', 
		function then() {
			this.click('#confirmCoordonne > div > div > label > input#v')
			this.test.assert(this.evaluate(function () {
				return document.querySelector('#confirmCoordonne > div > div > label > input#v').checked;
			}),"Confirmation check");
			this.capture('capture/ok-'+sectionid+'-' + myNumPers + '.png');
			this.click('#validateCoordonne');
			casper.waitWhileVisible('#loadingMsg',function() {},function() {test.fail("Waitoff timeout");});
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});

	casper.then(function() { // Step 3.3 - Choisir un accommodement
		console.log("Step 3.3 - Choisir un accommodement");
		var sectionid="accommodation"
		casper.waitForSelector('#validateDocument', 
		function then() {
			//var myAccommodation = Math.random() < 0.5 ? "YES" : "NO";
			myAccommodation="YES"
			if (myAccommodation == "NO") {
				this.click('#accomodement0 > div > div > label > input#v')
				this.test.assert(this.evaluate(function () {
					return document.querySelector('#accomodement0 > div > div > label > input#v').checked;
				}),"SANS Accommodation");
			} else {
				this.click('#accomodement1 > div > div > label > input#v')
				this.test.assert(this.evaluate(function () {
					return document.querySelector('#accomodement1 > div > div > label > input#v').checked;
				}),"Avec Accommodation");
				// Remplir la section des fichiers
				var numFile = Math.floor(Math.random() * 10) + 1
				console.log(numFile + " à charger sur le formulaire")
				for(var i = 0; i < numFile;i++){
					console.log("Ajout du fichier #"+(i+1))
					var obj = {};
					obj["input[type='text'][data-id='"+i+"']"] =  "test"+(i+1)+".txt"; // here the value of variable1 is used, not its name
					obj["input[type='file'][data-id='"+i+"']"] = "test"+(i+1)+".txt";
                	this.fillSelectors('form[id*="02D6"]',obj);
                }
			}
			this.capture('capture/ok-'+sectionid+'-' + myNumPers + '.png');
			this.click('#validateDocument');
			casper.waitWhileVisible('#loadingMsg',function() {},function() {test.fail("Waitoff timeout");});
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});

	casper.then(function() { // Step 3.4 - Choisir un site d'examen
		console.log("Step 3.4 - Choisir un site d'examen");
		var sectionid="picksite"
		casper.waitForSelector('#francais > div > div > label > input#v', 
		function then() {
			myLanguage = Math.random() < 0.5 ? "FR" : "EN";
			if (myLanguage == "FR") {
				this.click('#francais > div > div > label > input#v')
				this.test.assert(this.evaluate(function () {
						return document.querySelector('#francais > div > div > label > input#v').checked;
				}),"Français sélectionné");
			} else {
				this.click('#anglais > div > div > label > input#v')
				this.test.assert(this.evaluate(function () {
						return document.querySelector('#anglais > div > div > label > input#v').checked;
				}),"Anglais sélectionné");
			}

			//Choisir le bon site basé sur l'accommodement et la langue
			if (myAccommodation == "NO" && myLanguage == "FR") {
				this.click('input[data-centername="Québec"]')
				this.test.assert(this.evaluate(function () {
					return document.querySelector('input[data-centername="Québec"]').checked;
				}),"Le site de Québec est sélectionné");
			} else {
				this.click('input[data-centername="Montréal"]')
				this.test.assert(this.evaluate(function () {
					return document.querySelector('input[data-centername="Montréal"]').checked;
				}),"Le site de Montréal est sélectionné");				
			}
			this.capture('capture/ok-'+sectionid+'-' + myNumPers + '.png');
			this.click('#validateCenter');
			casper.waitWhileVisible('#loadingMsg',function() {},function() {test.fail("Waitoff timeout");});
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});

	casper.then(function() { // Step 3.5 - Répondre le légal
		console.log("Step 3.5 - Répondre le légal");
		var sectionid="legal"
		casper.waitForSelector('input[name=GSFT_Offense_Criminal]', 
		function then() {
			this.click('input[name=GSFT_Offense_Criminal][value*="Non"]');
			this.click('input[name=GSFT_Offense_Disciplinary][value*="Non"]');
			this.click('input[name=GSFT_Offense_Penal][value*="Non"]');
			this.capture('capture/ok-'+sectionid+'-' + myNumPers + '.png');
			this.click('#validateDecision');
			casper.waitWhileVisible('#loadingMsg',function() {},function() {test.fail("Waitoff timeout");});
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});

	casper.then(function() { // Step 3.6 - Confirmer l'inscription
		console.log("Step 3.6 - Confirmer l'inscription");
		var sectionid="confirm"
		casper.waitForSelector('#AttesterEngagement', 
		function then() {
			this.click('#attesterInscription > div > div > label > input#v')
			this.test.assert(this.evaluate(function () {
				return document.querySelector('#attesterInscription > div > div > label > input#v').checked;
			}),"Confirmation check");
			this.capture('capture/ok-'+sectionid+'-' + myNumPers + '.png');
			this.click('#AttesterEngagement');
			casper.waitWhileVisible('#loadingMsg',function() {},function() {test.fail("Waitoff timeout");});
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});

	casper.then(function() { // Step 3.7 - Faire le paiement
		console.log("Step 3.7 - Faire le paiement");
		var sectionid="paiement"
		casper.waitForSelector('#bank', 
		function then() {
			this.click('#bank > div > div > label > input#v')
			this.test.assert(this.evaluate(function () {
				return document.querySelector('#bank > div > div > label > input#v').checked;
			}),"Paiement par virement");

			this.click('#chkAcceptDW > div > div > label > input#chkAcceptDWId')
			this.test.assert(this.evaluate(function () {
				return document.querySelector('#chkAcceptDW > div > div > label > input#chkAcceptDWId').checked;
			}),"Confirme inscription avec paiement");

			this.click('input[name="bankList"][thisid="0x0000000000000006"]')
			this.test.assert(this.evaluate(function () {
				return document.querySelector('input[name="bankList"][thisid="0x0000000000000006"]').checked;
			}),"Banque Nationale");			

			this.click('#ChkEndDW > div > div > label > input#ChkEndDWId')
			this.test.assert(this.evaluate(function () {
				return document.querySelector('#ChkEndDW > div > div > label > input#ChkEndDWId').checked;
			}),"Confirme le virement complete");

			this.capture('capture/ok-'+sectionid+'-' + myNumPers + '.png');
			this.click('#btnFinish');
			casper.waitWhileVisible('#loadingMsg',function() {},function() {test.fail("Waitoff timeout");});
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});

	casper.then(function() { // Step 3.8 - Popup confirmation 
		console.log("Step 3.8 - Popup confirmation");
		var sectionid="popupconfirm"
		casper.waitUntilVisible('body > div.k-widget.k-window.k-window-titleless > div > div.text-center > button', 
		function then() {
			this.capture('capture/ok-'+sectionid+'-' + myNumPers + '.png');
			this.click('body > div.k-widget.k-window.k-window-titleless > div > div.text-center > button');
			casper.waitWhileVisible('#loadingMsg',function() {},function() {test.fail("Waitoff timeout");});
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});

	/*
	casper.then(function() { // Step x.y - titre
		console.log("Step x.y - titre");
		var sectionid=""
		casper.waitForSelector('', 
		function then() {
			this.capture('capture/ok-'+sectionid+'-' + myNumPers + '.png');
			this.click('');
			casper.waitWhileVisible('#loadingMsg',function() {},function() {test.fail("Waitoff timeout");});
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});
	*/

	casper.then(function() { // Une dernière capture d'écran avec le logout
		casper.waitWhileVisible('#loadingMsg',function() {this.capture('capture/ok-last-' + myNumPers + '.png');},function() {test.fail("Waitoff timeout");});
	});

	casper.then(function() { // Step 4.0 - Logout
		console.log("Step 4.0 - Logout")
		var sectionid="logout"
		casper.waitForSelector('a#deconnectBtn',
		function then() {
			test.assertExists('a#deconnectBtn', "Logout button is there");
			this.click('a#deconnectBtn');
			casper.waitWhileVisible('#loadingMsg',function() {},function() {test.fail("Waitoff timeout");});
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});

	casper.then(function() { // Step 4.1 - Vérifier que la page de login est là
		console.log("Step 4.1 - Vérifier que la page de login est là")
		var sectionid="waitloginpage"
		casper.waitForText('Ouverture',
		function then() {
			test.assertExists('button#Continue', "Login page loaded");
		},
		function timeout() {
			this.capture('capture/failed-'+sectionid+'-' + myNumPers + '.png');
			test.fail('Timeout on '+sectionid);
		});
	});

	casper.run(function() {
		console.log("Terminé le " + today.toString());
		test.done();
	});
});







