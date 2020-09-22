let width = 35;
let height = 35;
let body = document.body;
let kruskal = true;
let visualising = false;

let edges = []; //this needs to be sorted! (consist of u,v and edgeweight)
let vertices = [];
let oldEdges = [];
let oldVertices = [];

let currentPos = width*(height - 1);
let endPos = width - 1;

//adding appropriate borders
$("body").keydown(function(){
	let change = 0;
	let str = "#mazeGrid .";
	console.log("current position " + currentPos);
	console.log("width " + width);
	console.log($(str + String(currentPos)).css("border-left-color"));
	if (event.which === 37){ //left arrow pressed
		//when can we move left? if we aren't at % 0, 
		//we've added left borders, so 
		if (!(currentPos % width === 0) && ($(str + String(currentPos)).css("border-left-width") === "0px")){
			console.log("spasti menya");
			$(str + String(currentPos)).css("backgroundColor", "#FCB5B5");
			change = -1;
		}
	}
	else if (event.which === 38){
		if (!(currentPos < width) && ($(str + String(currentPos-width)).css("border-bottom-width") === "0px")){
			$(str + String(currentPos)).css("backgroundColor", "#FCB5B5");
			change = -width;
			console.log("spasti menya");
		}
		//up arrow pressed
	}
	else if (event.which === 39){
		if (!((currentPos+1) % (width) === 0) && ($(str + String(currentPos+1)).css("border-left-width") === "0px")){
			$(str + String(currentPos)).css("backgroundColor", "#FCB5B5");
			change = 1;
		}
		//right arrow pressed
	}
	else if (event.which === 40){ //down key pressed
		if (!(currentPos >= width*(height - 1)) && ($(str + String(currentPos)).css("border-bottom-width") === "0px")){
			$(str + String(currentPos)).css("backgroundColor", "#FCB5B5");
			change = width;
		}
	}
	currentPos += change;
	$(str + String(currentPos)).css("backgroundColor", "red");

	if (currentPos === endPos){
		alert("u win.");
	}
});


$(".setting").click(function(){
	//if it is active then leave it, else make it active 
	//then make sure all other buttons are non active
	if ($(this).find("a").hasClass("active")) {return;}
	else {
		$(".setting a").removeClass("active");
		$(this).find("a").addClass("active");
	}
	
	if (this.id === "visualiser"){
		$("table").css("float", "left");
		$("table").css("margin", "5% 9%");
		visualise();
	}
	else {
		toggle();
	}
});

$("#new").click(function(){
	//now we need to see what mode we are in - visualise or thign
	$(this).addClass("active");
	if (visualising){
		visualise();
	}
	else {
		kruskal = !kruskal;
		toggle();
	}
})



function toggle(){
	visualising = false;
	$("#new").text("New Maze");
	$("table").css("float", "none");
	kruskal = !kruskal;
	$("tr").remove();
	currentPos = width*(height - 1);
	endPos = width - 1;
	vertices = [];
	edges = [];
	generateGrid(false);
	if (kruskal){
		makeMazeEdgesKruskal(edges, vertices, false);
	}
	else {
		makeMazeEdgesPrim(edges, vertices, false);
	}
	style();
	setupUser();
}

//start by just highlighting where we are, or giving a fill. So:
function setupUser(){
	let str = "#mazeGrid .";
	$(str + String(currentPos)).css("backgroundColor", "red");
	$(str + String(endPos)).css("backgroundColor", "rgb(0, 100, 0)");
}

function style(){
	//general styling
	$(".leftBorder").css("border-left", "2px solid black");
	$(".bottomBorder").css("border-bottom", "2px solid black");
	$(".rightBorder").css("border-right", "2px solid black");
	$(".topBorder").css("border-top", "2px solid black");

	//general style
	$("table").css("border-collapse", "collapse");
	$("td").css("width", "20px");
	$("td").css("height", "20px");
}


function generateGrid(vis){

	for (let i = 0; i < height * width; i++){
		vertices.push({
			"id" : i,
			"neighbours" : [],
			"distance" : Infinity,
			"inTree" : false
		});
		oldVertices.push({
			"id" : i,
			"neighbours" : [],
			"distance" : Infinity,
			"inTree" : false
		})
	}

	for (let i = 0; i < height; i++){
		let tRow = $("<tr></tr>");
		for (let j = 0; j < width; j++){
			//usually connect edges down and left
			let id = i*width + j;
			let border = [];
			let left = true;
			let bottom = true;
			if (i === 0){
				//we are on the top row
				border.push("topBorder");
			}
			else if (i === height - 1){
				//we are on the last row
				bottom = false;
				border.push("bottomBorder");
			}
			if (j === 0){
				//we are on the first column
				left = false;
				border.push("leftBorder");
			}
			else if (j === width - 1){
				border.push("rightBorder");
			}
			let td = addEdgesVis(id, left, bottom, border);
			tRow.append(td);
		}
		if (vis) {
			let rowClone = tRow.clone();
			$("#secret").append(rowClone);
		}
		$("#mazeGrid").append(tRow);
		
		
	}
}


async function visualise(){
	//make smaller
	//visualise
	await new Promise(r => setTimeout(r, 2000));
	visualising = true;
	$("#new").text("New Visualisation");
	width = 20;
	height = 20;
	$("#visualise").unbind("click");
	$("#mazeGrid ").stop(true, true);
	$("tr").remove();
	//$("td").remove();
	currentPos = width*(height - 1);
	endPos = width - 1;
	vertices = [];
	edges = [];
	oldEdges = [];
	oldVertices = [];
	generateGrid(true);
	//get edges, get vertices... BUT we need copies for each one!
	makeMazeEdgesKruskal(edges, vertices, true);
	makeMazeEdgesPrim(oldEdges, oldVertices, true);

	style();
	$("#visualise").click(visualise);	
}

//implement Kruskal's algorithm

function makeMazeEdgesKruskal(e, v, vis){
	let inEdges = [];
	let partition = disjointSet();
	v.forEach(element => partition.add(element));
	e.sort(compareEdges);

	e.forEach(element => {
		if (!(partition.connected(v[(element["u"])], v[(element["v"])]))) {
			element["inMaze"] = true;
			inEdges.push(element);
			partition.union(v[(element["u"])], v[(element["v"])]);
		}
	}
	)

	fadeEdge(inEdges, true, vis);
}

function fadeEdge(elements, algoKruskal, vis){
	if (elements.length <= 0){
		return;
	}
	let element = elements.shift();
	let id = element["u"];
	let str;
	if (vis) {
		str = algoKruskal ? "#mazeGrid ." : "#secret .";
	}
	else {
		str = "#mazeGrid .";
	}
	
	let timeout = vis ? 300 : 0;
	if (element["u"] - element["v"] === 1){
		//it's connected to cell to left, so we add a border
		//$(str + String(id)).css("border-left", "2px solid black");
		if (vis){
			$(str + String(id)).animate({"borderLeftWidth" : "0px"}, {
			duration: timeout
			});
		//$(str + String(id)).css("backgroundColor", "#CF8E80");
			setTimeout(fadeEdge, timeout, elements, algoKruskal, vis);
		}
		else {
			$(str + String(id)).css("border-left", "0px solid black");
			fadeEdge(elements, algoKruskal, vis);
		}
		
	}
	else if (element["v"] - element["u"] === width){
		//it's cell below
		$(str + String(id)).css("border-bottom", "2px solid black");
		if (vis){
		$(str + String(id)).animate({"borderBottomWidth" : "0px"}, {
			duration: timeout
		});
		setTimeout(fadeEdge, timeout, elements, algoKruskal, vis);
		}
		//$(str + String(id)).css("backgroundColor", "#916953");
		else {
			$(str + String(id)).css("border-bottom", "0px solid black");
			fadeEdge(elements, algoKruskal, vis);
		}
	}
}


function makeMazeEdgesPrim(e, v, vis){
	let inEdges = [];

	let arbitraryVertex = v[endPos];
	arbitraryVertex["inTree"] = true;

	//my frontier needs to consist of edges
	let toExplore = new binaryHeap(
		function(element) {return element["edgeweight"]},
		function(element) {return [element["u"], element["v"]]},
		"edgeweight"
	);

	//we add edges that are connected
	arbitraryVertex.neighbours.forEach(element => {
		//again, neighbours has [id, edgeweight, edge]
		toExplore.push(element[2]);
	})

	while (toExplore.size() > 0){
		//we get the vertex
		let smallestWeightEdge = toExplore.pop();
		uVertex = v[smallestWeightEdge["u"]];
		vVertex = v[smallestWeightEdge["v"]];
		if (!(uVertex["inTree"] === true && vVertex["inTree"] === true)){
			smallestWeightEdge["inMaze"] = true;
			inEdges.push(smallestWeightEdge);
		}
		//problematic vertices[smallestWeightEdge["v"]]["inTree"] = true;
		let otherVertex = v[Number(smallestWeightEdge["v"])];
		//either smallestWeightEdge["u"] or smallestWeightEdge["v"]
		if (v[smallestWeightEdge["u"]]["inTree"] === true){
			otherVertex = v[smallestWeightEdge["v"]];
		}
		else{
			otherVertex = v[smallestWeightEdge["u"]];
		}
		otherVertex["inTree"] = true;
		otherVertex.neighbours.forEach(element => {
			//again, neighbours has [id, edgeweight, edge]
			uVertex = v[element[2]["u"]];
			vVertex = v[element[2]["v"]];
			if (!(toExplore.containsKey(element[2])) && ((uVertex["inTree"] === true && vVertex["inTree"] === false) || (uVertex["inTree"] === false && vVertex["inTree"] === true)))
				toExplore.push(element[2]);
			});

	}
	fadeEdge(inEdges, false, vis);
}

//method to compare edges to sort them by edgeweight!
function compareEdges(a, b){
	if (a["edgeweight"] > b["edgeweight"]) return 1;
	if (b["edgeweight"] > a["edgeweight"]) return -1;

	return 0;
}

function compareVertices(a, b){
	if (a["distance"] > b["distance"]) return 1;
	if (b["distance"] > a["distance"]) return -1;
	return 0;
}

function addEdgesVis(id, left, bottom, border){
	let td = $("<td></td>");

	let edgeweight = Math.ceil(Math.random() * 20);
	if (left){
		let edge = {
					"u" : id,
					"v" : id - 1, 
					"edgeweight" : edgeweight,
					"inMaze" : false
		}
		let edgeCopy = JSON.parse(JSON.stringify(edge));
		edges.push(edge);
		oldEdges.push(edge);
		vertices[id]["neighbours"].push([id - 1, edgeweight, edge]);
		vertices[id - 1]["neighbours"].push([id, edgeweight, edge]);
		oldVertices[id]["neighbours"].push([id - 1, edgeweight, edgeCopy]);
		oldVertices[id - 1]["neighbours"].push([id, edgeweight, edgeCopy]);
	}
	edgeweight = bottom ? Math.ceil(Math.random() * 20) : edgeweight;
	if (bottom){
		let edge = {
				"u" : id,
				"v" : id + width,
				"edgeweight" : edgeweight,
				"inMaze" : false
		}
		let edgeCopy = JSON.parse(JSON.stringify(edge));
		edges.push(edge);
		oldEdges.push(edge);
		vertices[id]["neighbours"].push([id + width, edgeweight, edge]);
		vertices[id+width]["neighbours"].push([id, edgeweight, edge]);
		oldVertices[id]["neighbours"].push([id + width, edgeweight, edgeCopy]);
		oldVertices[id+width]["neighbours"].push([id, edgeweight, edgeCopy]);
	}
	border.forEach(element => {
		td.addClass(element);
	})
	td.addClass(String(id));
	td.css("border-left", "2px solid black");
	td.css("border-bottom", "2px solid black");
	return td;
}


