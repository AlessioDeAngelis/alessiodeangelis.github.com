console.log('test');

var load = function(id, n) {
	var url = "https://raw.github.com/cvdlab-cg/" + id + "/master/2012-04-03/exercise" + n + ".js";

	var script = document.createElement('script');
	script.src = url;
	document.body.appendChild(script);

	return url;
};

var color_bone = [242 / 255, 234 / 255, 182 / 255, 1];
var aux_curves = [];
var domain1 = INTERVALS(1)(100);
var domain2 = DOMAIN([[0,1],[0,1]])([100, 100]);

var parseJson4PlasmPoints = function(jsonPoints, number_of_slices) {

	//var height = zValue || 0; //for problems with the z given from the json
	var num_slices = number_of_slices || 1000;

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
						var scalingFactor = 100;
						//to scale points' values
						var plasmPoints = [];

						//control points for plasm
						for(var j = 0; j < points.length; j++) {
							xx = points[j].x;
							yy = points[j].y;
							zz = points[j].z;
							plasmPoints[j] = [xx / scalingFactor, yy / scalingFactor, (zz) / 15];

						}
						if(points.length > 0)
							plasmPoints.push([(points[0].x) / scalingFactor, (points[0].y) / scalingFactor, (points[0].z) / 15]);
						//for closing the curve
						allPlasmPoints.push(plasmPoints);
						if(num_slices <= zz)//if you don't want to parse all the points
							return allPlasmPoints;
					}
				}
		}

	return allPlasmPoints;
}
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

	var allNubs = [];
	for(var i = 0; i < plasmPoints.length; i++) {
		if(plasmPoints[i].length > 0 || plasmPoints[i] != null) {

			var nubs = N(plasmPoints[i]);
			allNubs.push(nubs);
		}
	}
	return allNubs;
};

function removeByIndex(arrayName, arrayIndex) {
	arrayName.splice(arrayIndex, 1);
}

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

	//some edits in order to correct some drawing mistakes

	removeByIndex(allNubs, plasmPoints.length - 5);

	var lastCurve = plasmPoints[i - 1].map(function(p) {
		return [p[0], p[1], p[2] + 0.05]
	});

	allNubs.push(N(lastCurve));

	lastCurve = plasmPoints[i].map(function(p) {
		return [p[0] - 0.3, p[1] - 0.3, p[2] - 0.25];
	});

	allNubs.push(N(lastCurve));

	//removeByIndex(allNubs,plasmPoints.length-1);

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

var createModelLowFemur = function(jPoints, number_of_slices) {
	//var plasmPoints = parseJson4PlasmPoints(jPoints, number_of_slices);

	var p2Nubs = points2NubsPerFemore(jPoints);

	var s12 = NubsSup(p2Nubs);
	var surf = MAP(s12)(domain2);

	return surf;
};
var points2NubsPerFemore = function(plasmPoints) {

	var allNubs = [];
	for(var i = 0; i < plasmPoints.length - 1; i++) {
		if(plasmPoints[i].length > 0 || plasmPoints[i] != null) {
			var nubs = N(plasmPoints[i]);
			allNubs.push(nubs);
		}

	}

	//some edits in order to correct some drawing mistakes

	removeByIndex(allNubs, 1);

	var lastCurve = plasmPoints[i - 1].map(function(p) {
		return [p[0], p[1], p[2] + 0.05]
	});

	allNubs.push(N(lastCurve));

	lastCurve = plasmPoints[i].map(function(p) {
		return [p[0] - 0.3, p[1] - 0.3, p[2] - 0.25];
	});

	allNubs.push(N(lastCurve));

	//removeByIndex(allNubs,plasmPoints.length-1);

	return allNubs;
};



var createModel = function(jPoints, typeOfCurve) {
	//var plasmPoints = parseJson4PlasmPoints(jPoints, number_of_slices);

	var p2Nubs = points2Nubs(jPoints);

	var s12 = typeOfCurve(p2Nubs);
	//var s12 = NubsSup(p2Nubs);
	var surf = MAP(s12)(domain2);

	for(var i = 0; i < p2Nubs.length; i++) {
		var aux = p2Nubs[i];

		//DRAW(MAP(aux)(domain1));
	}

	return surf;
};

var sphereSurf = function(r, n) {9
	var domain = DOMAIN([[0,PI], [0,2*PI]])([n, n]);
	var mapping = function(p) {
		var u = p[0];
		var v = p[1];
		return [r * SIN(u) * COS(v), r * SIN(u) * SIN(v), r * COS(u)];
	};
	return MAP(mapping)(domain);
};

var translatePoints = function(points, delta) {
	// return points.map(function(p) {
	// if(p.length > 0)
	// return [p[0] + delta[0], p[1] + delta[1], p[2] + delta[2]];
	// });
	var ret = [];
	if(points != undefined)
		for(var i = 0; i < points.length; i++) {
			var p = points[i];
			if(p != undefined || p != null)
				ret.push([p[0] + delta[0], p[1] + delta[1], p[2] + delta[2]]);
		}
	return ret;

}
var drawModel = function() {
	var structArray = [];
	var bones = [];
	var points0 = parseJson4PlasmPoints(jsonPoints);
	//femore basso
	var points1 = parseJson4PlasmPoints(femore_alto_json, 22);
	var points2 = parseJson4PlasmPoints(femore_alto_piccolo, 22);
	var points_knee = parseJson4PlasmPoints(knee_json);
	var points_tibia = parseJson4PlasmPoints(tibia_json);
	var points_perone = parseJson4PlasmPoints(perone_json);
	var bottom_skin_points = parseJson4PlasmPoints(bottom_skin);
	//var puntiChiusura = [{"name":"Polyline","sets":{"keyArray":[0],"valArray":[[[{"x":420.2859802246094,"y":262.9733581542969,"z":0},{"x":420.96160888671875,"y":263.5138854980469,"z":0},{"x":420.2859802246094,"y":263.5138854980469,"z":0}]
	//points1.concat
	var femur = [];
	femur.push((createModelLowFemur(points0)));// LOW PART
	femur.push(T([0,1,2])([0,0,-1.5])(createModel(points1, BEZIER(S1))));
	//1-4
	femur.push(T([0,1,2])([0,0,-1.5])(createModel(points2, BEZIER(S1))));
	bones.push(T([0,1,2])([0,0,-1.5])(createModel(points_knee, BEZIER(S1))));
	bones.push(T([0,1,2])([0,0,-1.5])(createModel(points_tibia, NubsSup)));
	bones.push(T([0,1,2])([0,0,-1.5])(createModel(points_perone, NubsSup)));
	
	//var domain2 = DOMAIN([[0,1],[0,1]])([100, 100]);
	var tmp = points2Nubs(points0);
	//console.log("o vale " + points1[0]);

	var tmpCurve0 = tmp[0];
	//tmp = points2Nubs(translatePoints(points1, [1, 2, -2]));
	tmp = N(translatePoints(points1[points1.length - 2], [0, 0, -1.5]));

	var tmpCurve1 = tmp;
	
	var tmpCurve2 = N(translatePoints(points2[points2.length-1], [0, 0, -1.5]));

	femur.push(MAP(BEZIER(S1)([tmpCurve0,tmpCurve1,tmpCurve2]))(domain2));

	//structArray.push(sphereSurf(1,50));

	//var dom2D = TRIANGLE_DOMAIN(32, [[1,0,0],[0,1,0],[0,0,1]]);
	// var out = MAP(TRIANGULAR_COONS_PATCH([tmpCurve0,tmpCurve1,tmpCurve2]))(dom2D);
	// structArray.push(out);
	
	//var circularBase = BEZIER(S0)(translatePoints(points1[0],[0,0,-1.75]));
	
	//var closingPoint = (BEZIER(S0)([[0.4214066162109375,0.2633340759277344,-5]]));
	// var closingPoint = CUBIC_HERMITE(S0)(translatePoints([[0.467,0.2574,-5],[0.3765,0.2613,-5],[-1,0,1],[1,0,0]],[5,5,0]));
	// DRAW(COLOR([1,0,0])(MAP(closingPoint)(domain1)));
	// DRAW(COLOR([0,1,0])(MAP(circularBase)(domain1)));
	// structArray.push(MAP(BEZIER(S1)([circularBase,closingPoint]))(domain2));
	//structArray.push(MAP(ROTATIONAL_SURFACE(circularBase))(dom2D));
	//var low_part_translated = T([0,1,2])([0,0,-10])(low_part);
	var femur_translated = femur;
	structArray.push((T([0,1,2])([0,0,5.5])(COLOR(color_bone)(STRUCT(bones)))));
	structArray.push((COLOR(color_bone)(STRUCT(femur_translated))));
	
	//structArray.push(COLOR([1,0,0,0.3])(T([0,1,2])([0,0,-1.5])(createModel(bottom_skin_points, BEZIER(S1)))));
	
	var surfStruct = STRUCT(structArray);

	var surfRotated = S([2])([-1])(surfStruct);
	 var surfTrans = T([0,1,2])([-3,-3,3])(surfRotated);

	surfStruct = surfTrans;
	
	//var sphT = T([0,1,2])([1.2,-0.45,4.25])(sphereSurf(0.35, 20));
	//DRAW(COLOR(color_bone)(sphT));

	//for(var i = 0; i < p2Nubs.length; i++) {
	//var aux = p2Nubs[i];
	//var auxR = S([2])([-1])(aux);
	//var auxT = T([0,1,2])([-3,-3,3])(auxT);
	//DRAW(MAP(aux)(domain1));
	//}
	
	
	DRAW(surfStruct);
}();

var prova_rot = function() {

	var domain1 = INTERVALS(1)(100);
	var domain2 = DOMAIN([[0,1],[0,2*PI]])([20, 20]);
	//var plasmPoints = parseJson4PlasmPoints(prova_rot_alto);
	//console.log(plasmPoints[0]);
	var profile = BEZIER(S0)([[58.31903076171875, 22, 155.20965576171875], [47.4708366394043, 22, 148.42410278320312], [46.622642517089844, 22, 140.36624145507812], [44.50215530395508, 22, 135.27706909179688], [42.805763244628906, 22, 130.61199951171875], [42.38166427612305, 22, 128.06741333007812], [45.774444580078125, 22, 122.13004302978516], [49.16722869873047, 22, 117.88906860351562], [54.68049621582031, 22, 118.73725891113281]]);
	//var profile = BEZIER(S0)(plasmPoints[0]);
	var mapping = ROTATIONAL_SURFACE(profile);
	var surface = MAP(mapping)(domain2);
	DRAW(surface);
	DRAW(MAP(profile)(domain1));
};
