/* Create extra units so user input is
 * non-case-sensitive
*/

window.onload = function() {
  math.createUnit("HZ",  {definition: "1 Hz",  aliases: ['hz']  } );
  math.createUnit("MHZ", {definition: "1 MHz", aliases: ["Mhz"]  } );
  math.createUnit("GHZ", {definition: "1 GHz", aliases: ["Ghz"]  } );
  math.createUnit("THZ", {definition: "1 THz", aliases: ["Thz"]  } );
  
  // math.createUnit("Ohm",  {definition: "1 ohm",  aliases: ['OHM']  } );
  math.createUnit("kOhm",  {definition: "1 kohm",  aliases: ['KOHM', 'kOHM']  } );
  math.createUnit("MOhm",  {definition: "1 Mohm",  aliases: ['MOHM']  } );
  math.createUnit("GOhm",  {definition: "1 Gohm",  aliases: ['GOHM']  } );
  math.createUnit("TOhm",  {definition: "1 Tohm",  aliases: ['OHM']  } );
  
  // math.createUnit("HZ/V",  {definition: "1 Hz",  aliases: ['hz/V','Hz/V']  } );
  // math.createUnit("MHZ/V", {definition: "1 MHz", aliases: ["Mhz/V", "MHz/V"]  } );
  // math.createUnit("GHZ/V", {definition: "1 GHz", aliases: ["Ghz/V", "GHz/V"]  } );
  // math.createUnit("THZ/V", {definition: "1 THz", aliases: ["Thz/V", "THz/V"]  } );
  
  // synthPll();
  setFilterType();
}

var PM_PLOT_PRESENT = false;  // indicates that the plotGainPhaseMargin has been called once

/* Global object for storing all parameters for
 * the phase-locked loop
 */
var pll =   { fref:     10e6,
              R:        200,
              fpfd:     50e3,
              N:        39200,
              fout:     1960e6,
              fc:       10e3,
              kphi:     1e-3,
              kvco:     60e6,
              pm:       49.2 };

// supports up to 4th order passive or active
var loop_filter = { r2: 0,
                    r3: 0,
                    r4: 0,
                    c1: 0,
                    c2: 0,
                    c3: 0,
                    c4: 0,
                    a0: 0,
                    a1: 0,
                    a2: 0,
                    a3: 0,
                    t1: 0,
                    t2: 0,
                    t3: 0,
                    t4: 0,
                    type: 'passive',
                    order: 2 };



function synthPll () {
  if ( (loop_filter.type == 'passive') && (loop_filter.order == 2) ) {
    solveComponents( loop_type='passive2', gamma=1.024 );
  } else if ( (loop_filter.type == 'passive') && (loop_filter.order == 3) ) {
    solveComponents( loop_type='passive3', gamma=1.136 );
  } else if ( (loop_filter.type == 'passive') && (loop_filter.order == 4) ) {
    solveComponents( loop_type='passive4', gamma=1.115 );
  } 
   
}

/**
 * returns an array of complex numbers for the filter response
 * @param {Array} f
 * @returns {Array}
 */
function calculateZ( f, t1, t2, a0 ) {
    T1 = t1;
    T2 = t2;
    A0 = a0;
    var s = math.multiply( math.multiply( math.i,2*Math.PI ), f );
    var zt2 = math.add( 1, math.multiply(s, t2) );
    var zt1 = math.add( 1, math.multiply(s, t1) );
    var Z = [];
    for ( i=0; i<s.length; i++ ) {
      var zden = math.multiply( math.multiply(s[i], a0), zt1[i]);
      Z[i] = math.divide(zt2[i], zden);
    }

    return Z; 
}

/* given frequency array and impedance array,
 * return G(s)
 * */
function calculateG( f, z ) {
    var s = math.multiply( math.multiply( math.i,2*Math.PI ), f );
    var K = pll.kphi*pll.kvco;
    var g = [];

    for ( i=0; i<s.length; i++ ) {
      g.push( math.multiply( K, math.divide( z[i], s[i] ) ) ); 
    }
    return g;
}

function simulatePll( ) {
  my_url = "/pll_app/pll_calcs/callSimulatePllOpenLoop?"
  // my_url = "{{URL(pll_app,pll_calcs,callSimulatePllOpenLoop)}}"
  dat = "fstart=" + 1
        + "&fstop=" + 100e6
        + "&ptsPerDec=" + 99
        + "&kphi=" + pll.kphi
        + "&kvco=" + pll.kvco
        + "&N=" + pll.N
        + "&flt_type=" + loop_filter.type
        + "&c1=" + loop_filter.c1
        + "&c2=" + loop_filter.c2
        + "&r2=" + loop_filter.r2
        + "&c3=" + loop_filter.c3 
        + "&c4=" + loop_filter.c4 
        + "&r3=" + loop_filter.r3 
        + "&r4=" + loop_filter.r4;
  $.ajax( {
            type: "GET",
            url: my_url,
            datatype: 'json',
            async: true,
            data: dat,
            success: function (data) {
              // console.log(data)
              if (PM_PLOT_PRESENT) {
                updateGainPhaseMarginGraph( data.gains , data.phases, data.freqs );
                setPm(data.pzero);
                setFc(data.fzero); 
                // console.log("fzero = " + data.fzero);
                // console.log("pzero = " + data.pzero);
              } else {
                plotGainPhaseMargin( data.gains , data.phases, data.freqs );
                PM_PLOT_PRESENT = true;  
              }
            },
            error: function (result) {
            }
  });
}

function testFun() {
  // console.log( document.getElementById("t1").style.top );
  // document.getElementById("t1").style.top = "90%";
  console.log( $("#pll4_passive_div").width() );
  // console.log(document.getElementById("t1").parentElement.nodeName);
  // $("#t1").detach().appendTo("#pll3_passive_div");
  // console.log(document.getElementById("t1").parentElement.nodeName);
}


function setFilterType() {
  if ( document.getElementById("selFilterType").value == 0 ) {
    loop_filter.type = 'passive';
    loop_filter.order = 2;
    loadPll2PassiveForm();
  } else if ( document.getElementById("selFilterType").value == 1 ) {
    loop_filter.type = 'passive';
    loop_filter.order = 3;
    loadPll3PassiveForm();
  } else if ( document.getElementById("selFilterType").value == 2 ) {
    loop_filter.type = 'passive';
    loop_filter.order = 4;
    loadPll4PassiveForm();
  } else if ( document.getElementById("selFilterType").value == 3 ) {
    loop_filter.type = 'passive';
    loop_filter.order = 4;
    loadPll4PassiveForm2();
    // loop_filter.type = 'active';
    // loop_filter.order = 2;
  } else if ( document.getElementById("selFilterType").value == 4 ) {
    loop_filter.type = 'active';
    loop_filter.order = 3;
  } else if ( document.getElementById("selFilterType").value == 5 ) {
    loop_filter.type = 'active';
    loop_filter.order = 4;
  } else if ( document.getElementById("selFilterType").value == 6 ) {
    console.log('new filter type');
  }
 synthPll(); 
}

/* move all of the form inputs to the appropriate div
 * and shows the appropriate image
 */
function loadPll4PassiveForm() {
  
  document.getElementById("pll3_passive_div").style.display = "none";
  document.getElementById("pll2_passive_div").style.display = "none";

  document.getElementById("pll4_passive_div").style.display = "block";

  var mydiv = "#pll4_passive_div";

  $("#fltTypeLabel").detach().appendTo(mydiv);

 
  $("#fcLabel").detach().appendTo(mydiv);
  document.getElementById("fcLabel").style.display = "block";
  document.getElementById("fcLabel").style.top = "17%";
  document.getElementById("fcLabel").style.left = "0%";

  $("#fc").detach().appendTo(mydiv);
  document.getElementById("fc").style.display = "block";
  document.getElementById("fc").style.top = "16%";
  document.getElementById("fc").style.left = "18%";

  $("#pmLabel").detach().appendTo(mydiv);
  document.getElementById("pmLabel").style.display = "block";
  document.getElementById("pmLabel").style.top = "1%";
  document.getElementById("pmLabel").style.left = "0%";

  $("#pm").detach().appendTo(mydiv);
  document.getElementById("pm").style.display = "block";
  document.getElementById("pm").style.top = "0%";
  document.getElementById("pm").style.left = "18%";

  $("#selFilterType").detach().appendTo(mydiv);
  document.getElementById("selFilterType").style.display = "block";
  document.getElementById("selFilterType").style.top = "0%";
  document.getElementById("selFilterType").style.left = "70%";

  // 1st 
  $("#c1").detach().appendTo(mydiv);
  document.getElementById("c1").style.display = "block";
  document.getElementById("c1").style.top = "54%";
  document.getElementById("c1").style.left = "9.5%";

  $("#t1Label").detach().appendTo(mydiv);
  document.getElementById("t1Label").style.display = "none";

  $("#t1").detach().appendTo(mydiv);
  document.getElementById("t1").style.display = "none";

  // 2nd
  $("#r2").detach().appendTo(mydiv);
  document.getElementById("r2").style.display = "block";
  document.getElementById("r2").style.top = "68%";
  document.getElementById("r2").style.left = "33%";

  $("#c2").detach().appendTo(mydiv);
  document.getElementById("c2").style.display = "block";
  document.getElementById("c2").style.top = "48%";
  document.getElementById("c2").style.left = "33%";

  $("#t2Label").detach().appendTo(mydiv);
  document.getElementById("t2Label").style.display = "none";

  $("#t2").detach().appendTo(mydiv);
  document.getElementById("t2").style.display = "none";

  // 3rd
  $("#r3").detach().appendTo(mydiv);
  document.getElementById("r3").style.display = "block";
  document.getElementById("r3").style.top = "25%";
  document.getElementById("r3").style.left = "43%";

  $("#c3").detach().appendTo(mydiv);
  document.getElementById("c3").style.display = "block";
  document.getElementById("c3").style.top = "54%";
  document.getElementById("c3").style.left = "60%";

  $("#t3Label").detach().appendTo(mydiv);
  document.getElementById("t3Label").style.display = "none";

  $("#t3").detach().appendTo(mydiv);
  document.getElementById("t3").style.display = "none";

  // 4th
  $("#r4").detach().appendTo(mydiv);
  document.getElementById("r4").style.display = "block";
  document.getElementById("r4").style.top = "25%";
  document.getElementById("r4").style.left = "68%";

  $("#c4").detach().appendTo(mydiv);
  document.getElementById("c4").style.display = "block";
  document.getElementById("c4").style.top = "54%";
  document.getElementById("c4").style.left = "85%";

  $("#t4Label").detach().appendTo(mydiv);
  document.getElementById("t4Label").style.display = "none";

  $("#t4").detach().appendTo(mydiv);
  document.getElementById("t4").style.display = "none";

}

/* move all of the form inputs to the appropriate div
 * and shows the appropriate image
 */
function loadPll3PassiveForm() {
  document.getElementById("pll2_passive_div").style.display = "none";
  document.getElementById("pll4_passive_div").style.display = "none";

  document.getElementById("pll3_passive_div").style.display = "block";

  var mydiv = "#pll3_passive_div";

  $("#fltTypeLabel").detach().appendTo(mydiv);

 
  $("#fcLabel").detach().appendTo(mydiv);
  document.getElementById("fcLabel").style.display = "block";
  document.getElementById("fcLabel").style.top = "17%";
  document.getElementById("fcLabel").style.left = "0%";

  $("#fc").detach().appendTo(mydiv);
  document.getElementById("fc").style.display = "block";
  document.getElementById("fc").style.top = "16%";
  document.getElementById("fc").style.left = "18%";

  $("#pmLabel").detach().appendTo(mydiv);
  document.getElementById("pmLabel").style.display = "block";
  document.getElementById("pmLabel").style.top = "1%";
  document.getElementById("pmLabel").style.left = "0%";

  $("#pm").detach().appendTo(mydiv);
  document.getElementById("pm").style.display = "block";
  document.getElementById("pm").style.top = "0%";
  document.getElementById("pm").style.left = "18%";


  $("#selFilterType").detach().appendTo(mydiv);
  document.getElementById("selFilterType").style.display = "block";
  document.getElementById("selFilterType").style.top = "0%";
  document.getElementById("selFilterType").style.left = "70%";

  // 1st 
  $("#c1").detach().appendTo(mydiv);
  document.getElementById("c1").style.display = "block";
  document.getElementById("c1").style.top = "54%";
  document.getElementById("c1").style.left = "9.5%";

  $("#t1Label").detach().appendTo(mydiv);
  document.getElementById("t1Label").style.display = "none";

  $("#t1").detach().appendTo(mydiv);
  document.getElementById("t1").style.display = "none";

  // 2nd
  $("#r2").detach().appendTo(mydiv);
  document.getElementById("r2").style.display = "block";
  document.getElementById("r2").style.top = "68%";
  document.getElementById("r2").style.left = "33%";

  $("#c2").detach().appendTo(mydiv);
  document.getElementById("c2").style.display = "block";
  document.getElementById("c2").style.top = "48%";
  document.getElementById("c2").style.left = "33%";

  $("#t2Label").detach().appendTo(mydiv);
  document.getElementById("t2Label").style.display = "none";

  $("#t2").detach().appendTo(mydiv);
  document.getElementById("t2").style.display = "none";

  // 3rd
  $("#r3").detach().appendTo(mydiv);
  document.getElementById("r3").style.display = "block";
  document.getElementById("r3").style.top = "25%";
  document.getElementById("r3").style.left = "43%";

  $("#c3").detach().appendTo(mydiv);
  document.getElementById("c3").style.display = "block";
  document.getElementById("c3").style.top = "54%";
  document.getElementById("c3").style.left = "60%";

  $("#t3Label").detach().appendTo(mydiv);
  document.getElementById("t3Label").style.display = "none";

  $("#t3").detach().appendTo(mydiv);
  document.getElementById("t3").style.display = "none";

  // 4th
  $("#r4").detach().appendTo(mydiv);
  document.getElementById("r4").style.display = "none";

  $("#c4").detach().appendTo(mydiv);
  document.getElementById("c4").style.display = "none";

  $("#t4Label").detach().appendTo(mydiv);
  document.getElementById("t4Label").style.display = "none";

  $("#t4").detach().appendTo(mydiv);
  document.getElementById("t4").style.display = "none";

}


/* move all of the form inputs to the appropriate div
 * and shows the appropriate image
 */
function loadPll2PassiveForm() {
  
  document.getElementById("pll3_passive_div").style.display = "none";
  document.getElementById("pll4_passive_div").style.display = "none";

  document.getElementById("pll2_passive_div").style.display = "block";

  var mydiv = "#pll2_passive_div";

  $("#fltTypeLabel").detach().appendTo(mydiv);

 
  $("#fcLabel").detach().appendTo(mydiv);
  document.getElementById("fcLabel").style.display = "block";
  document.getElementById("fcLabel").style.top = "17%";
  document.getElementById("fcLabel").style.left = "0%";

  $("#fc").detach().appendTo(mydiv);
  document.getElementById("fc").style.display = "block";
  document.getElementById("fc").style.top = "16%";
  document.getElementById("fc").style.left = "18%";

  $("#pmLabel").detach().appendTo(mydiv);
  document.getElementById("pmLabel").style.display = "block";
  document.getElementById("pmLabel").style.top = "1%";
  document.getElementById("pmLabel").style.left = "0%";

  $("#pm").detach().appendTo(mydiv);
  document.getElementById("pm").style.display = "block";
  document.getElementById("pm").style.top = "0%";
  document.getElementById("pm").style.left = "18%";


  $("#selFilterType").detach().appendTo(mydiv);
  document.getElementById("selFilterType").style.display = "block";
  document.getElementById("selFilterType").style.top = "0%";
  document.getElementById("selFilterType").style.left = "70%";


  // 1st 
  $("#c1").detach().appendTo(mydiv);
  document.getElementById("c1").style.display = "block";
  document.getElementById("c1").style.top = "54%";
  document.getElementById("c1").style.left = "9.5%";

  $("#t1Label").detach().appendTo(mydiv);
  document.getElementById("t1Label").style.display = "none";

  $("#t1").detach().appendTo(mydiv);
  document.getElementById("t1").style.display = "none";

  // 2nd
  $("#r2").detach().appendTo(mydiv);
  document.getElementById("r2").style.display = "block";
  document.getElementById("r2").style.top = "68%";
  document.getElementById("r2").style.left = "33%";

  $("#c2").detach().appendTo(mydiv);
  document.getElementById("c2").style.display = "block";
  document.getElementById("c2").style.top = "48%";
  document.getElementById("c2").style.left = "33%";

  $("#t2Label").detach().appendTo(mydiv);
  document.getElementById("t2Label").style.display = "none";

  $("#t2").detach().appendTo(mydiv);
  document.getElementById("t2").style.display = "none";

  // 3rd
  $("#r3").detach().appendTo(mydiv);
  document.getElementById("r3").style.display = "none";

  $("#c3").detach().appendTo(mydiv);
  document.getElementById("c3").style.display = "none";

  $("#t3Label").detach().appendTo(mydiv);
  document.getElementById("t3Label").style.display = "none";

  $("#t3").detach().appendTo(mydiv);
  document.getElementById("t3").style.display = "none";

  // 4th
  $("#r4").detach().appendTo(mydiv);
  document.getElementById("r4").style.display = "none";

  $("#c4").detach().appendTo(mydiv);
  document.getElementById("c4").style.display = "none";

  $("#t4Label").detach().appendTo(mydiv);
  document.getElementById("t4Label").style.display = "none";

  $("#t4").detach().appendTo(mydiv);
  document.getElementById("t4").style.display = "none";

}


function solveComponents( loop_type, gamma ) {
  my_url = "/pll_app/pll_calcs/solveForComponents?";
  dat = "loop_type=" + loop_type 
        + "&fc=" + pll.fc 
        + "&pm=" + pll.pm
        + "&kphi=" + pll.kphi
        + "&kvco=" + pll.kvco
        + "&N=" + pll.N
        + "&gamma=" + gamma;

  $.ajax( {
            type: "GET",
            url: my_url,
            datatype: 'json',
            async: true,
            data: dat,
            success: function (data) {
              RET_DATA = data
              setT1(data.t1);
              setT2(data.t2);
              setT3(data.t3);
              setT4(data.t4);
              setA0(data.a0);
              setA1(data.a1);
              setA2(data.a2);
              setA3(data.a3);
              setC1(data.c1);
              setC2(data.c2);
              setC3(data.c3);
              setC4(data.c4);
              setR2(data.r2);
              setR3(data.r3);
              setR4(data.r4);
              simulatePll();
            },
            error: function (result) {
            }
  });
}

// getters for form values

/*
* read the selectedIndex of the select and return the
* multiplier. For instance, if selected index is 3 (MHz),
* return 10e6.
* @param {id} id of select element
* @return {Number}
*/
function get_frequency_multiplier(idElement) {
  var mult = document.getElementById(idElement).selectedIndex;
  return Math.pow(10,3*mult);
}

/*
* read the selectedIndex of the select and return the
* multiplier. For instance, if selected index is 2 (mA),
* return 10e-3.
* @param {id} id of select element
* @return {Number}
*/
function get_current_multiplier(idElement) {
  var mult = document.getElementById(idElement).selectedIndex;
  return Math.pow(10,-3*mult);
}


// setters for form values

/* set the global value for fc and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setFc(val) {
  pll.fc = val;
  document.getElementById("fc").value = math.unit(pll.fc,"Hz").format(3);
  
}


/* set the global value for kphi and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setKphi(val) {
  pll.kphi = val;
  document.getElementById("kphi").value = math.unit(pll.kphi,"A").toString();
}

/* set the global value for kvco and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setKvco(val) {
  pll.kvco = val;
  document.getElementById("kvco").value = math.unit(pll.kvco,"Hz").toString();
}

/* set the global value for pm and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setPm(val) {
  pll.pm = val;
  document.getElementById("pm").value = math.unit(pll.pm,"deg").format(3);
}


/* set the global value for fref and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setFref(val) {
  pll.fref = val;
  document.getElementById("fref").value = math.unit(pll.fref,"Hz").toString();
}


/* set the global value for fout and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setFout(val) {
  pll.fout = val;
  document.getElementById("fout").value = math.unit(pll.fout,"Hz").toString();
}


/* set the global value for fpfd and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setFpfd(val) {
  pll.fpfd = val;
  document.getElementById("fpfd").value = math.unit(pll.fpfd,"Hz").toString();
}


/* set the global value for R and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setR(val) {
  pll.R = val
  document.getElementById("divR").value = val;
}

/* set the global value for N and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setN(val) {
  pll.N = val
  document.getElementById("divN").value = val;
}

function setT2(val) {
  loop_filter.t2 = val;
  document.getElementById("t2").value = math.unit(loop_filter.t2,"s").format(3);
}

function setT1(val) {
  loop_filter.t1 = val;
  document.getElementById("t1").value = math.unit(loop_filter.t1,"s").format(3);
}

function setC1(val) {
  loop_filter.c1 = val;
  document.getElementById("c1").value = math.unit(loop_filter.c1,"F").format(3);
}

function setC2(val) {
  loop_filter.c2 = val;
  document.getElementById("c2").value = math.unit(loop_filter.c2,"F").format(3);
}

function setC3(val) {
  loop_filter.c3 = val;
  document.getElementById("c3").value = math.unit(loop_filter.c3,"F").format(3);
}

function setC4(val) {
  loop_filter.c4 = val;
  document.getElementById("c4").value = math.unit(loop_filter.c4,"F").format(3);
}

function setR2(val) {
  loop_filter.r2 = val;
  document.getElementById("r2").value = math.unit(loop_filter.r2,"ohm").format(3);
}

function setR3(val) {
  loop_filter.r3 = val;
  document.getElementById("r3").value = math.unit(loop_filter.r3,"ohm").format(3);
}

function setR4(val) {
  loop_filter.r4 = val;
  document.getElementById("r4").value = math.unit(loop_filter.r4,"ohm").format(3);
}

function setA0(val) {
  loop_filter.a0 = val
  var val = val.toExponential(2);
  // document.getElementById("a0").value = val;
}

function setA1(val) {
  loop_filter.a1 = val
  var val = val.toExponential(2);
  // document.getElementById("a1").value = val;
}

function setA2(val) {
  loop_filter.a2 = val
  var val = val.toExponential(2);
  // document.getElementById("a2").value = val;
}

function setA3(val) {
  loop_filter.a3 = val
  var val = val.toExponential(2);
  // document.getElementById("a3").value = val;
}
function setT3(val) {
  loop_filter.t3 = val;
  document.getElementById("t3").value = math.unit(loop_filter.t3,"s").format(3);
}

function setT4(val) {
  loop_filter.t4 = val;
  document.getElementById("t4").value = math.unit(loop_filter.t4,"s").format(3);
}


// form event handlers

/* User changes C1. Resimulate loop.
 * write new value for fc and pm
*/
function onC1Changed() {
  var val_str = document.getElementById("c1").value;
  var val_good = check_unit( val_str, "F", "c1" );
  if (val_good) {
    setC1( math.unit( document.getElementById("c1").value ).value ); 
  } else {
    document.getElementById("c1").value = math.unit(loop_filter.c1,"F").format(3);
    return;
  }

  simulatePll();
}

/* User changes C2. Resimulate loop.
 * write new value for fc and pm
*/
function onC2Changed() {
  var val_str = document.getElementById("c2").value;
  var val_good = check_unit( val_str, "F", "c2" );
  if (val_good) {
    setC2( math.unit( document.getElementById("c2").value ).value ); 
  } else {
    document.getElementById("c2").value = math.unit(loop_filter.c2,"F").format(3);
    return;
  }

  simulatePll();
}

/* User changes C3. Resimulate loop.
 * write new value for fc and pm
*/
function onC3Changed() {
  var val_str = document.getElementById("c3").value;
  var val_good = check_unit( val_str, "F", "c3" );
  if (val_good) {
    setC3( math.unit( document.getElementById("c3").value ).value ); 
  } else {
    document.getElementById("c3").value = math.unit(loop_filter.c3,"F").format(3);
    return;
  }

  simulatePll();

}

/* User changes C4. Resimulate loop.
 * write new value for fc and pm
*/
function onC4Changed() {
  var val_str = document.getElementById("c4").value;
  var val_good = check_unit( val_str, "F", "c4" );
  if (val_good) {
    setC4( math.unit( document.getElementById("c4").value ).value ); 
  } else {
    document.getElementById("c4").value = math.unit(loop_filter.c4,"F").format(3);
    return;
  }

  simulatePll();

}

/* User changes R2. Resimulate loop.
 * write new value for fc and pm
*/
function onR2Changed() {
  var val_str = document.getElementById("r2").value;
  var val_good = check_unit( val_str, "ohm", "r2" );
  if (val_good) {
    setR2( math.unit( document.getElementById("r2").value ).value ); 
  } else {
    document.getElementById("r2").value = math.unit(loop_filter.r2,"ohm").format(3);
    return;
  }

  simulatePll();

}

/* User changes R3. Resimulate loop.
 * write new value for fc and pm
*/
function onR3Changed() {
  var val_str = document.getElementById("r3").value;
  var val_good = check_unit( val_str, "ohm", "r3" );
  if (val_good) {
    setR3( math.unit( document.getElementById("r3").value ).value ); 
  } else {
    document.getElementById("r3").value = math.unit(loop_filter.r3,"ohm").format(3);
    return;
  }

  simulatePll();

}

/* User changes R4. Resimulate loop.
 * write new value for fc and pm
*/
function onR4Changed() {
  var val_str = document.getElementById("r4").value;
  var val_good = check_unit( val_str, "ohm", "r4" );
  if (val_good) {
    setR4( math.unit( document.getElementById("r4").value ).value ); 
  } else {
    document.getElementById("r4").value = math.unit(loop_filter.r4,"ohm").format(3);
    return;
  }

  simulatePll();

}


/* User changes Fref. Calculate new fpfd
 * and new fout
*/
function onFrefChanged() {
  var val_str = document.getElementById("fref").value;
  var val_good = check_unit( val_str, "Hz", "fref" );
  if (val_good) {
    setFref( math.unit( document.getElementById("fref").value ).value ); 
  } else {
    document.getElementById("fref").value = math.unit(pll.fref,"Hz").toString();
    return;
  }

  setFpfd( pll.fref/pll.R );
  setFout( pll.fpfd*pll.N );
  synthPll();
}

/* User changes Fout. Calculate new value
 * for N and set N
 * */
function onFoutChanged() {
  var val_str = document.getElementById("fout").value;
  var val_good = check_unit( val_str, "Hz", "fout" );
  if (val_good) {
    setFout( math.unit( document.getElementById("fout").value ).value ); 
  } else {
    document.getElementById("fout").value = math.unit(pll.fout,"Hz").toString();
    return;
  }

  N = pll.fout/pll.fpfd;
  setN(N);
  synthPll();
}

/* User changes Fpfd. Calculate new value for R
 * and N and set them both
 */
function onFpfdChanged() {
  var val_str = document.getElementById("fpfd").value;
  var val_good = check_unit( val_str, "Hz", "fpfd" );
  if (val_good) {
    setFpfd( math.unit( document.getElementById("fpfd").value ).value ); 
  } else {
    document.getElementById("fpfd").value = math.unit(pll.fpfd,"Hz").toString();
    return;
  }
  setR( Math.round( pll.fref/pll.fpfd, 0) ); // force integer
  setFpfd( pll.fref/pll.R ); // set fpfd again if original was not integer
  setN(pll.fout/pll.fpfd);

  synthPll();
}

/* User changes N. Calculate new value
 * for fout and set fout
 * */
function onNChanged() {
  pll.N = parseFloat( document.getElementById("divN").value );
  setFout(pll.fpfd*pll.N);

  synthPll();
}

/* User changes Fout. Calculate new value
 * for N and set N
 * */
function onFoutChanged() {
  var val_str = document.getElementById("fout").value;
  var val_good = check_unit( val_str, "Hz", "fout" );
  if (val_good) {
    setFout( math.unit( document.getElementById("fout").value ).value ); 
  } else {
    document.getElementById("fout").value = math.unit(pll.fout,"Hz").toString();
    return;
  }
  setN(pll.fout/pll.fpfd);

  synthPll();
}

/* User changes Kphi. Loop is resynthesized.
 * */
function onKphiChanged() {
  var val_str = document.getElementById("kphi").value;
  var val_good = check_unit( val_str, "A", "kphi" );
  if (val_good) {
    setKphi( math.unit( document.getElementById("kphi").value ).value ); 
  } else {
    document.getElementById("kphi").value = math.unit(pll.kphi,"A").toString();
    return;
  }

  synthPll();
}

/* User changes Kvco. Loop is resynthesized.
 * */
function onKvcoChanged() {
  var val_str = document.getElementById("kvco").value;
  var val_good = check_unit( val_str, "Hz", "kvco" );
  if (val_good) {
    setKvco( math.unit( document.getElementById("kvco").value ).value ); 
  } else {
    document.getElementById("kvco").value = math.unit(pll.kvco,"Hz").toString();
    return;
  }

  synthPll();
}

/* User changes Fc. Loop is resynthesized
 * and then resimulated
 * */
function onFcChanged() {
  var val_str = document.getElementById("fc").value;
  var val_good = check_unit( val_str, "Hz", "fc" );
  if (val_good) {
    setFc( math.unit( document.getElementById("fc").value ).value ); 
  } else {
    document.getElementById("fc").value = math.unit(pll.fc,"Hz").toString();
    return;
  }

  synthPll();
}

/* User changes Pm. Loop is resynthesized 
 * and then resimulated
 * TBD: for some reason the simulation barfs when pm is 90 degrees
 * */
function onPmChanged() {
  var val_str = document.getElementById("pm").value;
  var val_good = check_unit( val_str, "deg", "pm" );
  if (val_good) {
    setPm( math.unit( document.getElementById("pm").value ).toJSON().value ); // without toJSON it will return in radians
  } else {
    document.getElementById("pm").value = math.unit(pll.pm,"deg").toString();
    return;
  }

  synthPll();
}

/* User changes R. Calculate new value for 
 * Fpfd and set Fpfd. Then calculate new Value for N
 * and set N.
 * Leave Fout unchanged.
 * */
function onRChanged() {
  pll.R = parseFloat( document.getElementById("divR").value );
  setFpfd(pll.fref/pll.R);
  setN(pll.fout/pll.fpfd);

  synthPll();
}


/* checks the value of the user input for proper formatting against
 * the unit. returns true if good.
 * @param {String} or {Number} - value captured from the form input
 * @param {String} - desired unit
 * @param {String} - id tag of input
 * @returns {Boolean}
 */
function check_unit( val, unit, id ) {
  if ( isNaN(val) ) {
    // val is not a number. check if is correctly formatted for unit
    // console.log(math.unit(val));
    try {
      document.getElementById(id).value = math.unit(val).toString();
    }
    catch(err) {
      // not formatted correctly, so return false
      return false;
    }
  } else {
    // val is number so automatically good
    // set field to user-friendly format
    document.getElementById(id).value = math.unit(val,unit).toString();
  }
  return true;
}


