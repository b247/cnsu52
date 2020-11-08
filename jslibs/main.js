//sw

if ('serviceWorker' in navigator) {
	console.log('CLIENT: service worker registration in progress.');
	navigator.serviceWorker.register('/sw.js').then(function(registration) {
		console.log('CLIENT: service worker registration complete.');
		// registration.update();
	}, function() {
		console.log('CLIENT: service worker registration failure.');
	});
} else {
	console.log('CLIENT: service worker is not supported.');
}


let formData = {}
let positions = {

	nume : [61.562, 40.026-1.933],
	prenume : [119.549, 40.026-1.933],

	adresa_buletin : [61.562, 49.691-1.833],
	adresa_de_resedinta : [61.562, 59.504-1.933],

	data_nastere_ziua: [61.562, 67.743-1.833],
	data_nastere_luna: [74.035, 67.743-1.833],
	data_nastere_an: [86.588, 67.743-1.833],
	localitate: [133.811, 67.743-1.833],
	
	organizatie: [92.841, 116.33-1.933],
	sediu_organizatie: [59.141, 121.749-1.833],
	adresa_punct_de_lucru_1: [38.32, 132.893],
	
	motivul_deplasarii_1 : [31.609, 110.817+0.692],
	motivul_deplasarii_2 : [31.609, 149.738+0.692],
	motivul_deplasarii_3 : [31.609, 161.764+0.692],
	motivul_deplasarii_4 : [31.609, 173.432+0.692],
	motivul_deplasarii_5 : [31.609, 185.554+0.692],

	today : [38.458, 234.5],
	semnatura : [134.751, 228],

}
// console.log(positions)
function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}
let mobileOS = getMobileOperatingSystem();


$(function () {

	let generatePdfBtn = $('#generatePdfBtn');

	let loadingDiv = $('#loading-container');
	let declaratieForm = $('#declaratie');
	let signatureBlackboard = $("#signature-container");
	let signatureBlackboardReset = $("#signature-reset");
	let signatureHolographic = $("#signature");
	let androidIndicator = $("#android-downloads-indicator");

	signatureHolographic.jSignature();
	signatureBlackboardReset.click(function(e){signatureHolographic.jSignature('reset')});
	
	declaratieForm.submit(function(e){
		e.preventDefault();

		generatePdfBtn.prop('disabled',true);
		loadingDiv.removeClass('d-none');

		var sData = declaratieForm.find(':input').not('#semnatura').serializeArray();
		signatureVector = signatureHolographic.jSignature('getData');

		var today = new Date().toJSON().slice(0,10).split('-').reverse().join('.');

		var doc = new jsPDF('p', 'mm', 'a4', true);
		doc.addFileToVFS("Merriweather_Regular.ttf", Merriweather_Regular);
    	doc.addFont('Merriweather_Regular.ttf', 'Merriweather_Regular', 'normal');
    	doc.setFont('Merriweather_Regular');
		doc.setFontSize(11);
		// doc.setTextColor('#004890');
		doc.addImage(background, 'PNG', 0, 0, 210, 297);

		for(var field in sData) {
			if(typeof positions[sData[field].name] !== 'undefined') {
				if (sData[field].value == 'check') {
					doc.circle(positions[sData[field].name][0] + 1.5, positions[sData[field].name][1] + 1.5, 2, 'F');
				} else {
					doc.text(positions[sData[field].name][0] + 1, positions[sData[field].name][1] + 5, sData[field].value);
				}
				formData[sData[field].name] = sData[field].value;
			}
		}

		var semnatura_info = doc.getImageProperties(signatureVector);
		var ratio = semnatura_info.width / semnatura_info.height;
		var height = 17;
		var width = height * ratio;
		doc.addImage(signatureVector, 'PNG', positions['semnatura'][0], positions['semnatura'][1] + 10 - height, width, height);

		doc.text(positions['today'][0], positions['today'][1], today);


		var docname = 'DECLARAȚIE PE PROPRIE RĂSPUNDERE COVID-19 cf. Hotărâre CNSU nr.52, ' + formData.nume + ' ' +formData.prenume +', '+today+'.pdf';
		doc.save(docname, { returnPromise: true }).then( setTimeout(function(){
			loadingDiv.addClass('d-none');
			generatePdfBtn.prop('disabled',false);
			if (mobileOS == 'Android') {
				androidIndicator.removeClass('d-none');
				setTimeout(function(){ androidIndicator.addClass('d-none');}, 5000);
			}
		}, 700) );
	})
})