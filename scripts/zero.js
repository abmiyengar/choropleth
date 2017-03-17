function zeroTabFunc(event)
{
	console.log("F(zeroTabFunc): ENTER");
	var i, tabcontent, tablinks;
	var varId;
	//show the first tab content and hide the rest
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	document.getElementById("zero").style.display = "block";
	event.currentTarget.className += " active";
	
}