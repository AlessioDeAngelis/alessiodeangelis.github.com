console.log('test');

var load = function(id, n) {
	var url = "https://raw.github.com/cvdlab-cg/" + id + "/master/2012-04-03/exercise" + n + ".js";

	var script = document.createElement('script');
	script.src = url;
	document.body.appendChild(script);

	return url;
};



var color_bone = [242 / 255, 234 / 255, 182 / 255, 1];


var parseJson4PlasmPoints = function(jsonPoints, zValue) {

	//var height = zValue || 0; //for problems with the z given from the json

	var allPlasmPoints = [];

	for(var pl_num = 0; pl_num < 3; pl_num++)
		for(var k = 0; k < jsonPoints.plugins[pl_num].sets.valArray.length; k++) {//plugin[0] for points from Polyline plugin
			var allJsonPoints = jsonPoints.plugins[pl_num].sets.valArray[k];
			if(allJsonPoints != null)
				for(var i = 0; i < allJsonPoints.length; i++) {
					var points = allJsonPoints[i];

					//if(points != null || typeof (points) === "object") {
					if(points.length > 0) {
						var xx;
						var yy;
						var zz;
						var scalingFactor = 10;
						//to scale points' values
						var plasmPoints = [];
						//control points for plasm
						for(var j = 0; j < points.length; j++) {
							xx = points[j].x;
							yy = points[j].y;
							zz = points[j].z;
							plasmPoints[j] = [xx / scalingFactor, yy / scalingFactor, (zz) / 10];
						}
						if(points.length > 0)
							plasmPoints.push([(points[0].x) / scalingFactor, (points[0].y) / scalingFactor, (points[0].z) / 10]);
						//for closing the curve
						allPlasmPoints.push(plasmPoints);
					}
				}
		}

	return allPlasmPoints;
}
/* FOR MODELING
*
*  */

//var domain1 = INTERVALS(1)(100);
//var domain2 = DOMAIN([[0,1],[0,1]])([100,100]);

/*Models a Nubs, given its control points*/
var N = function(controlPoints, degree) {

	/*Computes the knots array*/
	var k = degree || 2;
	var m = controlPoints.length;
	var n = (m + k + 1);
	var lastValue = n - 3;
	var knots = [];
	var knotValue = 0;

	for(var i = 0; i < (k + 1); i++)
		knots.push(knotValue);

	knotValue++;

	for(var i = (k + 1); i < lastValue; i++) {
		knots.push(knotValue);
		knotValue++;
	};

	for(var i = lastValue; i < n; i++)
		knots[i] = knotValue;

	return NUBS(S0)(k)(knots)(controlPoints);
};

var points2Nubs = function(plasmPoints) {
	//var domain1 = INTERVALS(1)(100);
	//var domain2 = DOMAIN([[0,1],[0,1]])([100, 100]);
	var allNubs = [];
	for(var i = 0; i < plasmPoints.length; i++) {
		if(plasmPoints[i].length > 0 || plasmPoints[i] != null) {
			if(i%10==0){
			var nubs = N(plasmPoints[i]);
			allNubs.push(nubs);
		}
		}
	}
	return allNubs;
};

var points2NubsPerFemore = function(plasmPoints) {
	//var domain1 = INTERVALS(1)(100);
	//var domain2 = DOMAIN([[0,1],[0,1]])([100, 100]);
	var allNubs = [];
	for(var i = 0; i < plasmPoints.length - 1; i++) {
		if(plasmPoints[i].length > 0 || plasmPoints[i] != null) {

			var nubs = N(plasmPoints[i]);
			allNubs.push(nubs);
		}

	}

	var lastCurve = plasmPoints[i].map(function(p) {
		return [p[0], p[1], p[2]-0.4]
	});
	allNubs.push(N(lastCurve));
	
	return allNubs;
};

/*Models a Nubs, given its control points*/
var NubsSup = function(controlPoints, degree) {

	/*Computes the knots array*/
	var k = degree || 2;
	var m = controlPoints.length;
	var n = (m + k + 1);
	var lastValue = n - 3;
	var knots = [];
	var knotValue = 0;

	for(var i = 0; i < (k + 1); i++)
		knots.push(knotValue);

	knotValue++;

	for(var i = (k + 1); i < lastValue; i++) {
		knots.push(knotValue);
		knotValue++;
	};

	for(var i = lastValue; i < n; i++)
		knots[i] = knotValue;

	return NUBS(S1)(k)(knots)(controlPoints);
};

var drawModel = function(jPoints) {
	var domain1 = INTERVALS(1)(100);
	var domain2 = DOMAIN([[0,1],[0,1]])([100, 100]);
	var plasmPoints = parseJson4PlasmPoints(jPoints);
	//console.log("parsati");
	var p2Nubs = points2Nubs(plasmPoints); //per tutti gli altri
	//var p2Nubs = points2NubsPerFemore(plasmPoints);

	//console.log("points2nubs");
	//	var s12 = BEZIER(S1)(p2Nubs); //BEZIER
	//	var surf = MAP(s12)(domain2);

	var s12 = NubsSup(p2Nubs);
	var surf = MAP(s12)(domain2);

	//DRAW(T([0,1])([30,20])(surf));
	
	//var surfRotated = S([2])([-1])(surf);
	//var surfTrans = T([0,1,2])([-3,-3,3])(surfRotated);
	DRAW(COLOR(color_bone)(surf));
	for(var i = 0; i < p2Nubs.length; i++) {
		var aux = p2Nubs[i];
		//var auxR = S([2])([-1])(aux);
		//var auxT = T([0,1,2])([-3,-3,3])(auxT);
		//DRAW(MAP(aux)(domain1));
	}
};

drawModel(jsonPoints);
